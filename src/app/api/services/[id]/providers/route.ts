import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext, withTenantIsolation } from '@/lib/tenant-context'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { assignProvidersSchema } from '@/lib/validations/service'
import { z } from 'zod'

/**
 * PUT /api/services/[id]/providers
 * Assign providers to a service (replaces existing assignments)
 */
export async function PUT(
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
    const { providerIds } = assignProvidersSchema.parse(body)

    // Verify all providers belong to this company
    const providers = await prisma.provider.findMany({
      where: {
        id: { in: providerIds },
        companyId,
        isActive: true,
      },
    })

    if (providers.length !== providerIds.length) {
      return errorResponse('One or more providers not found or inactive', 400)
    }

    // Replace provider assignments in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Remove existing assignments
      await tx.serviceProvider.deleteMany({
        where: { serviceId: params.id },
      })

      // Create new assignments
      await tx.serviceProvider.createMany({
        data: providerIds.map((providerId) => ({
          serviceId: params.id,
          providerId,
        })),
      })

      // Return updated service with providers
      return tx.service.findUnique({
        where: { id: params.id },
        include: {
          providers: {
            include: {
              provider: true,
            },
          },
        },
      })
    })

    return successResponse(result)
  } catch (error) {
    console.error('Error assigning providers:', error)

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return errorResponse('Forbidden', 403)
    }

    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        400
      )
    }

    return errorResponse('Failed to assign providers', 500)
  }
}
