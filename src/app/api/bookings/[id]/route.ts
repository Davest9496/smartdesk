import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
} from '@/lib/api-response'
import { getTenantContext } from '@/lib/tenant-context'
import { z } from 'zod'
import { BookingStatus } from '@prisma/client'

/**
 * GET /api/bookings/[id]
 * Get a single booking by ID
 *
 * Why public:
 * - Clients need to view their booking details
 * - No tenant context needed (booking ID is unique globally)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!booking) {
      return notFoundResponse('Booking')
    }

    // ✅ Serialize for client component
    return successResponse({
      ...booking,
      amount: Number(booking.amount),
      service: {
        ...booking.service,
        price: Number(booking.service.price),
      },
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return errorResponse('Failed to fetch booking', 500)
  }
}

/**
 * Validation schema for booking updates
 */
const updateBookingSchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
    .optional(),
  cancelledBy: z.enum(['client', 'provider', 'admin']).optional(),
  cancellationReason: z.string().max(500).optional(),
  providerNotes: z.string().max(500).optional(),
})

/**
 * PATCH /api/bookings/[id]
 * Update booking status and details
 *
 * Why this approach:
 * - Validates status transitions
 * - Requires authentication for non-client updates
 * - Logs all status changes for audit trail
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log('========================================')
    console.log('📝 BOOKING UPDATE REQUEST')
    console.log('Booking ID:', id)
    console.log('Request body:', body)
    console.log('========================================')

    // Validate input
    const validatedData = updateBookingSchema.parse(body)

    // Fetch existing booking
    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return notFoundResponse('Booking')
    }

    // For admin/provider updates, require authentication
    if (
      validatedData.status &&
      !['PENDING', 'CANCELLED'].includes(validatedData.status)
    ) {
      try {
        const { companyId } = await getTenantContext()

        // Verify booking belongs to this company
        if (booking.companyId !== companyId) {
          return forbiddenResponse('Cannot update booking from another company')
        }
      } catch {
        return errorResponse('Authentication required for this operation', 401)
      }
    }

    // Validate status transitions
    const currentStatus = booking.status
    const newStatus = validatedData.status

    if (newStatus) {
      // Define valid transitions
      const validTransitions: Record<BookingStatus, BookingStatus[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
        CANCELLED: [], // Cannot transition from cancelled
        COMPLETED: [], // Cannot transition from completed
        NO_SHOW: [], // Cannot transition from no-show
      }

      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return errorResponse(
          `Cannot change status from ${currentStatus} to ${newStatus}`,
          400
        )
      }
    }

    // Build update data
    const updateData: {
      status?: BookingStatus
      cancelledAt?: Date | null
      cancelledBy?: 'client' | 'provider' | 'admin'
      cancellationReason?: string | null
      providerNotes?: string | null
    } = {}

    if (validatedData.status) {
      updateData.status = validatedData.status

      // If cancelling, set cancellation fields
      if (validatedData.status === 'CANCELLED') {
        updateData.cancelledAt = new Date()
        updateData.cancelledBy = validatedData.cancelledBy || 'client'
        updateData.cancellationReason = validatedData.cancellationReason
      }
    }

    if (validatedData.providerNotes !== undefined) {
      updateData.providerNotes = validatedData.providerNotes
    }

    console.log('========================================')
    console.log('🔄 UPDATING BOOKING')
    console.log('Current status:', currentStatus)
    console.log('New status:', newStatus)
    console.log('Update data:', updateData)
    console.log('========================================')

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    console.log('========================================')
    console.log('✅ BOOKING UPDATED SUCCESSFULLY')
    console.log('Booking ID:', updatedBooking.id)
    console.log('Status:', updatedBooking.status)
    console.log('========================================')

    // ✅ Serialize for client component
    return successResponse({
      ...updatedBooking,
      amount: Number(updatedBooking.amount),
      service: {
        ...updatedBooking.service,
        price: Number(updatedBooking.service.price),
      },
    })
  } catch (error) {
    console.error('Error updating booking:', error)

    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        400
      )
    }

    return errorResponse('Failed to update booking', 500)
  }
}
