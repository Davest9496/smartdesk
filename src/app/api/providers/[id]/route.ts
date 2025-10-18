import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext, withTenantIsolation } from '@/lib/tenant-context'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { updateProviderSchema } from '@/lib/validations/provider'
import { z } from 'zod'

/**
 * GET /api/providers/[id]
 * Get a single provider by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext()

    const provider = await prisma.provider.findUnique({
      where: { id: params.id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        workingHours: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        _count: {
          select: { bookings: true },
        },
      },
    })

    if (!provider) {
      return notFoundResponse('Provider')
    }

    // Verify tenant isolation
    withTenantIsolation(provider, companyId)

    return successResponse(provider)
  } catch (error) {
    console.error('Error fetching provider:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorised')) {
        return errorResponse('Unauthorised', 401)
      }
      if (error.message.includes('Forbidden')) {
        return errorResponse('Forbidden', 403)
      }
    }

    return errorResponse('Failed to fetch provider', 500)
  }
}

/**
 * PATCH /api/providers/[id]
 * Update a provider (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId, role } = await getTenantContext()

    if (role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin access required', 403)
    }

    // Verify provider exists and belongs to this company
    const existingProvider = await prisma.provider.findUnique({
      where: { id: params.id },
    })

    if (!existingProvider) {
      return notFoundResponse('Provider')
    }

    withTenantIsolation(existingProvider, companyId)

    const body = await request.json()
    const validatedData = updateProviderSchema.parse(body)

    // Check email uniqueness if being updated
    if (validatedData.email) {
      const emailTaken = await prisma.provider.findFirst({
        where: {
          companyId,
          email: validatedData.email,
          id: { not: params.id },
        },
      })

      if (emailTaken) {
        return errorResponse('Email already in use by another provider', 400)
      }
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        services: {
          include: {
            service: true,
          },
        },
        workingHours: true,
      },
    })

    return successResponse(updatedProvider)
  } catch (error) {
    console.error('Error updating provider:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorised')) {
        return errorResponse('Unauthorised', 401)
      }
      if (error.message.includes('Forbidden')) {
        return errorResponse('Forbidden', 403)
      }
    }

    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        400
      )
    }

    return errorResponse('Failed to update provider', 500)
  }
}

/**
 * DELETE /api/providers/[id]
 * Soft delete a provider (Admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId, role } = await getTenantContext()

    if (role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin access required', 403)
    }

    const provider = await prisma.provider.findUnique({
      where: { id: params.id },
    })

    if (!provider) {
      return notFoundResponse('Provider')
    }

    withTenantIsolation(provider, companyId)

    // Soft delete by setting isActive to false
    await prisma.provider.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return successResponse({ message: 'Provider deactivated successfully' })
  } catch (error) {
    console.error('Error deleting provider:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorised')) {
        return errorResponse('Unauthorised', 401)
      }
      if (error.message.includes('Forbidden')) {
        return errorResponse('Forbidden', 403)
      }
    }

    return errorResponse('Failed to delete provider', 500)
  }
}
