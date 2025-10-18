import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext } from '@/lib/tenant-context'
import { successResponse, errorResponse } from '@/lib/api-response'
import { createServiceSchema } from '@/lib/validations/service'
import { z } from 'zod'

/**
 * GET /api/services
 * List all services for the authenticated company
 */
export async function GET(request: NextRequest) {
  try {
    const { companyId } = await getTenantContext()

    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const publicOnly = searchParams.get('publicOnly') === 'true'

    const services = await prisma.service.findMany({
      where: {
        companyId,
        ...(includeInactive ? {} : { isActive: true }),
        ...(publicOnly ? { isPublic: true } : {}),
      },
      include: {
        providers: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
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
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return successResponse(services)
  } catch (error) {
    console.error('Error fetching services:', error)

    if (error instanceof Error && error.message.includes('Unauthorised')) {
      return errorResponse('Unauthorised', 401)
    }

    return errorResponse('Failed to fetch services', 500)
  }
}

/**
 * POST /api/services
 * Create a new service (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { companyId, role } = await getTenantContext()

    if (role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin access required', 403)
    }

    const body = await request.json()
    const validatedData = createServiceSchema.parse(body)

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        companyId,
      },
      include: {
        providers: {
          include: {
            provider: true,
          },
        },
      },
    })

    return successResponse(service, 201)
  } catch (error) {
    console.error('Error creating service:', error)

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

    return errorResponse('Failed to create service', 500)
  }
}
