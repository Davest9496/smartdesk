import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { calculateAvailableSlots } from '@/lib/availability/calculator'
import { z } from 'zod'

/**
 * Validation schema for availability query parameters
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
  companyId: z.string().cuid('Invalid company ID'),
})

/**
 * GET /api/availability
 *
 * Query parameters:
 * - providerId: Provider's ID
 * - serviceId: Service's ID
 * - date: Date in YYYY-MM-DD format
 * - companyId: Company ID (for multi-tenancy)
 *
 * Returns: Array of available time slots
 *
 * Why public endpoint:
 * - Clients need to see availability before booking
 * - No authentication required (read-only operation)
 * - Company ID validates the request belongs to the correct tenant
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extract query parameters
    const queryParams = {
      providerId: searchParams.get('providerId'),
      serviceId: searchParams.get('serviceId'),
      date: searchParams.get('date'),
      companyId: searchParams.get('companyId'),
    }

    // Validate parameters
    const validatedParams = availabilityQuerySchema.parse(queryParams)

    // Parse date
    const date = new Date(validatedParams.date)

    // Calculate availability
    const availableSlots = await calculateAvailableSlots({
      providerId: validatedParams.providerId,
      serviceId: validatedParams.serviceId,
      date,
      companyId: validatedParams.companyId,
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
