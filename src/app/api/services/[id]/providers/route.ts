import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext } from '@/lib/tenant-context'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

// Validation schema for provider assignment
const assignProvidersSchema = z.object({
  providerIds: z
    .array(z.string().cuid())
    .min(1, 'At least one provider required'),
})

/**
 * PUT /api/services/[id]/providers
 * Assign providers to a service (replaces existing assignments)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Params is now a Promise
) {
  try {
    const { companyId, role } = await getTenantContext()
    const { id: serviceId } = await params // ✅ Await params before accessing properties

    if (role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin access required', 403)
    }

    // Verify service exists and belongs to tenant
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        companyId,
      },
    })

    if (!service) {
      return errorResponse('Service not found', 404)
    }

    // Parse and validate request body
    const body = await request.json()
    const { providerIds } = assignProvidersSchema.parse(body)

    // Verify all providers belong to this company
    const providers = await prisma.provider.findMany({
      where: {
        id: { in: providerIds },
        companyId,
      },
    })

    if (providers.length !== providerIds.length) {
      return errorResponse('One or more providers not found', 400)
    }

    // Replace existing assignments with new ones (transactional)
    await prisma.$transaction(async (tx) => {
      // Delete existing assignments
      await tx.serviceProvider.deleteMany({
        where: { serviceId },
      })

      // Create new assignments
      await tx.serviceProvider.createMany({
        data: providerIds.map((providerId) => ({
          serviceId,
          providerId,
        })),
      })
    })

    // Fetch updated service with providers
    const updatedService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        providers: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return successResponse(updatedService)
  } catch (error) {
    console.error('Error assigning providers:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes('Unauthorised')) {
        return errorResponse('Unauthorised', 401)
      }
      if (error.message.includes('Forbidden')) {
        return errorResponse('Forbidden', 403)
      }
    }

    return errorResponse('Failed to assign providers', 500)
  }
}

/**
 * GET /api/services/[id]/providers
 * Get all providers assigned to a service
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Params is now a Promise
) {
  try {
    const { companyId } = await getTenantContext()
    const { id: serviceId } = await params // ✅ Await params

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        companyId,
      },
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
              },
            },
          },
        },
      },
    })

    if (!service) {
      return errorResponse('Service not found', 404)
    }

    return successResponse(service.providers)
  } catch (error) {
    console.error('Error fetching service providers:', error)

    if (error instanceof Error && error.message.includes('Unauthorised')) {
      return errorResponse('Unauthorised', 401)
    }

    return errorResponse('Failed to fetch service providers', 500)
  }
}
