import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-response'

/**
 * GET /api/bookings/[id]
 * Get a single booking by ID
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

    return successResponse(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return errorResponse('Failed to fetch booking', 500)
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update booking status (e.g., cancel booking)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return notFoundResponse('Booking')
    }

    // Only allow cancellation of PENDING or CONFIRMED bookings
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return errorResponse('Booking cannot be cancelled', 400)
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: body.cancelledBy || 'client',
        cancellationReason: body.cancellationReason,
      },
      include: {
        service: true,
        provider: true,
        client: true,
      },
    })

    return successResponse(updatedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return errorResponse('Failed to update booking', 500)
  }
}
