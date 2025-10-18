import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext, withTenantIsolation } from '@/lib/tenant-context'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import {
  updateWorkingHoursSchema,
  validateTimeRange,
} from '@/lib/validations/provider'
import { z } from 'zod'

/**
 * GET /api/providers/[id]/working-hours
 * Get working hours for a provider
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext()

    const provider = await prisma.provider.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    })

    if (!provider) {
      return notFoundResponse('Provider')
    }

    withTenantIsolation(provider, companyId)

    const workingHours = await prisma.workingHours.findMany({
      where: { providerId: params.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return successResponse(workingHours)
  } catch (error) {
    console.error('Error fetching working hours:', error)

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return errorResponse('Forbidden', 403)
    }

    return errorResponse('Failed to fetch working hours', 500)
  }
}

/**
 * PUT /api/providers/[id]/working-hours
 * Replace all working hours for a provider (Admin only)
 */
export async function PUT(
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
      select: { companyId: true },
    })

    if (!provider) {
      return notFoundResponse('Provider')
    }

    withTenantIsolation(provider, companyId)

    const body = await _request.json()
    const { workingHours } = updateWorkingHoursSchema.parse(body)

    // Validate all time ranges
    for (const hours of workingHours) {
      if (!validateTimeRange(hours.startTime, hours.endTime)) {
        return errorResponse(
          `Invalid time range: ${hours.startTime} - ${hours.endTime}`,
          400
        )
      }
    }

    // Replace all working hours in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing working hours
      await tx.workingHours.deleteMany({
        where: { providerId: params.id },
      })

      // Create new working hours
      await tx.workingHours.createMany({
        data: workingHours.map((hours) => ({
          providerId: params.id,
          ...hours,
        })),
      })

      // Fetch the created records
      const newWorkingHours = await tx.workingHours.findMany({
        where: { providerId: params.id },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      })

      return newWorkingHours
    })

    return successResponse(result)
  } catch (error) {
    console.error('Error updating working hours:', error)

    if (error instanceof Error) {
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

    return errorResponse('Failed to update working hours', 500)
  }
}
