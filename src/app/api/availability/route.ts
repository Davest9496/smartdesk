import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { calculateAvailableSlots } from '@/lib/availability/calculator'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * Validation schema for availability query parameters
 *
 * Why no companyId:
 * - Public endpoint (no auth required)
 * - CompanyId derived from serviceId for security
 * - Simpler client-side API calls
 */
const availabilityQuerySchema = z.object({
  providerId: z.string().cuid('Invalid provider ID'),
  serviceId: z.string().cuid('Invalid service ID'),
  date: z.string().refine(
    (val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    },
    { message: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD)' }
  ),
})

/**
 * GET /api/availability
 *
 * Query parameters:
 * - providerId: Provider's ID
 * - serviceId: Service's ID
 * - date: Date in ISO 8601 format (YYYY-MM-DD)
 *
 * Returns: Array of available time slots
 *
 * Why public endpoint:
 * - Clients need to see availability before booking
 * - No authentication required (read-only operation)
 * - Multi-tenancy enforced by validating service belongs to provider's company
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extract query parameters
    const queryParams = {
      providerId: searchParams.get('providerId'),
      serviceId: searchParams.get('serviceId'),
      date: searchParams.get('date'),
    }

    // Validate parameters
    const validatedParams = availabilityQuerySchema.parse(queryParams)

    // 🔒 Security: Derive companyId from service
    // This ensures the service exists and gets the correct tenant context
    const service = await prisma.service.findUnique({
      where: { id: validatedParams.serviceId },
      select: {
        companyId: true,
        isActive: true,
        isPublic: true,
      },
    })

    if (!service) {
      return errorResponse('Service not found', 404)
    }

    if (!service.isActive || !service.isPublic) {
      return errorResponse('Service is not available for booking', 400)
    }

    // 🔒 Verify provider belongs to same company
    const provider = await prisma.provider.findUnique({
      where: { id: validatedParams.providerId },
      select: {
        companyId: true,
        isActive: true,
      },
    })

    if (!provider) {
      return errorResponse('Provider not found', 404)
    }

    if (provider.companyId !== service.companyId) {
      return errorResponse('Provider does not offer this service', 400)
    }

    if (!provider.isActive) {
      return errorResponse('Provider is not available', 400)
    }

    // Parse date
    const date = new Date(validatedParams.date)

    // Validate date is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      return errorResponse('Cannot book appointments in the past', 400)
    }

    // Calculate availability using the derived companyId
    const availableSlots = await calculateAvailableSlots({
      providerId: validatedParams.providerId,
      serviceId: validatedParams.serviceId,
      date,
      companyId: service.companyId, // ✅ Derived from service
    })

    return successResponse({
      date: validatedParams.date,
      providerId: validatedParams.providerId,
      serviceId: validatedParams.serviceId,
      availableSlots: availableSlots.map((slot) => ({
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
      })),
      totalSlots: availableSlots.length,
    })
  } catch (error) {
    console.error('Error calculating availability:', error)

    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        400
      )
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400)
    }

    return errorResponse('Failed to calculate availability', 500)
  }
}
