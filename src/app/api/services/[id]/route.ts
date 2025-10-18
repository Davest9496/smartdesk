import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext, withTenantIsolation } from '@/lib/tenant-context'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { updateServiceSchema } from '@/lib/validations/service'
import { z } from 'zod'

/**
 * GET /api/services/[id]
 * Get a single service by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext()

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        providers: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                imageUrl: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    })

    if (!service) {
      return notFoundResponse('Service')
    }

    withTenantIsolation(service, companyId)

    return successResponse(service)
  } catch (error) {
    console.error('Error fetching service:', error)

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return errorResponse('Forbidden', 403)
    }

    return errorResponse('Failed to fetch service', 500)
  }
}

/**
 * PATCH /api/services/[id]
 * Update a service (Admin only)
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

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    })

    if (!service) {
      return notFoundResponse('Service')
    }

    withTenantIsolation(service, companyId)

    const body = await request.json()
    const validatedData = updateServiceSchema.parse(body)

    const updatedService = await prisma.service.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        providers: {
          include: {
            provider: true,
          },
        },
      },
    })

    return successResponse(updatedService)
  } catch (error) {
    console.error('Error updating service:', error)

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return errorResponse('Forbidden', 403)
    }

    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        400
      )
    }

    return errorResponse('Failed to update service', 500)
  }
}

/**
 * DELETE /api/services/[id]
 * Soft delete a service (Admin only)
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

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    })

    if (!service) {
      return notFoundResponse('Service')
    }

    withTenantIsolation(service, companyId)

    await prisma.service.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return successResponse({ message: 'Service deactivated successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return errorResponse('Forbidden', 403)
    }

    return errorResponse('Failed to delete service', 500)
  }
}
