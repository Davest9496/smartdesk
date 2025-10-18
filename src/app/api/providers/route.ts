import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext } from '@/lib/tenant-context'
import { successResponse, errorResponse } from '@/lib/api-response'
import { createProviderSchema } from '@/lib/validations/provider'
import { z } from 'zod'

/**
 * GET /api/providers
 * List all providers for the authenticated company
 */
export async function GET(request: NextRequest) {
  try {
    const { companyId } = await getTenantContext()

    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const providers = await prisma.provider.findMany({
      where: {
        companyId,
        ...(includeInactive ? {} : { isActive: true }),
      },
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
      orderBy: { name: 'asc' },
    })

    return successResponse(providers)
  } catch (error) {
    console.error('Error fetching providers:', error)

    if (error instanceof Error && error.message.includes('Unauthorised')) {
      return errorResponse('Unauthorised', 401)
    }

    return errorResponse('Failed to fetch providers', 500)
  }
}

/**
 * POST /api/providers
 * Create a new provider (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { companyId, role } = await getTenantContext()

    if (role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin access required', 403)
    }

    const body = await request.json()
    const validatedData = createProviderSchema.parse(body)

    // Check if provider email already exists for this company
    const existingProvider = await prisma.provider.findFirst({
      where: {
        companyId,
        email: validatedData.email,
      },
    })

    if (existingProvider) {
      return errorResponse(
        'A provider with this email already exists in your company',
        400
      )
    }

    const provider = await prisma.provider.create({
      data: {
        ...validatedData,
        companyId,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        workingHours: true,
      },
    })

    return successResponse(provider, 201)
  } catch (error) {
    console.error('Error creating provider:', error)

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

    return errorResponse('Failed to create provider', 500)
  }
}
