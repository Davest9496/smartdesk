import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { createBookingSchema } from '@/lib/validations/booking'
import { calculateAvailableSlots } from '@/lib/availability/calculator'
import { z } from 'zod'

/**
 * GET /api/bookings
 * Get bookings for a client (requires email query param)
 * Or get all bookings for a company (requires authentication)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientEmail = searchParams.get('clientEmail')
    const companyId = searchParams.get('companyId')

    if (clientEmail) {
      // Public endpoint: client checking their bookings
      const client = await prisma.client.findUnique({
        where: { email: clientEmail },
      })

      if (!client) {
        return successResponse({ bookings: [] })
      }

      const bookings = await prisma.booking.findMany({
        where: { clientId: client.id },
        include: {
          service: true,
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
      })

      return successResponse({ bookings })
    }

    if (companyId) {
      // For authenticated company users (would need auth check in production)
      const bookings = await prisma.booking.findMany({
        where: { companyId },
        include: {
          service: true,
          provider: true,
          client: true,
        },
        orderBy: { startTime: 'desc' },
      })

      return successResponse({ bookings })
    }

    return errorResponse('Missing required parameters', 400)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return errorResponse('Failed to fetch bookings', 500)
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 *
 * Why this flow:
 * 1. Validate all inputs
 * 2. Check slot is still available (race condition protection)
 * 3. Find or create client
 * 4. Create booking with PENDING status
 * 5. Return booking ID for payment processing
 *
 * Note: Booking is PENDING until payment succeeds
 * Payment will be handled by Stripe and confirmed via webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    const {
      serviceId,
      providerId,
      startTime,
      companyId,
      clientName,
      clientEmail,
      clientPhone,
      clientNotes,
    } = validatedData

    // 1. Verify service exists and belongs to company
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        companyId,
        isActive: true,
        isPublic: true,
      },
    })

    if (!service) {
      return errorResponse('Service not found or unavailable', 404)
    }

    // 2. Verify provider is assigned to this service
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: {
        serviceId_providerId: {
          serviceId,
          providerId,
        },
      },
    })

    if (!serviceProvider) {
      return errorResponse('Provider not available for this service', 400)
    }

    // 3. Calculate slot availability (CRITICAL: race condition check)
    const bookingDate = new Date(startTime)
    const availableSlots = await calculateAvailableSlots({
      providerId,
      serviceId,
      date: bookingDate,
      companyId,
    })

    // Check if requested time slot is available
    const isSlotAvailable = availableSlots.some(
      (slot) =>
        slot.startTime.getTime() === new Date(startTime).getTime() &&
        slot.available
    )

    if (!isSlotAvailable) {
      return errorResponse(
        'Selected time slot is no longer available. Please choose another slot.',
        409
      )
    }

    // 4. Calculate end time
    const endTime = new Date(
      new Date(startTime).getTime() + service.duration * 60000
    )

    // 5. Find or create client
    let client = await prisma.client.findUnique({
      where: { email: clientEmail },
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          email: clientEmail,
          name: clientName,
          phone: clientPhone,
        },
      })
    } else {
      // Update client details if provided
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: clientName,
          phone: clientPhone || client.phone,
        },
      })
    }

    // 6. Create booking with PENDING status (awaiting payment)
    const booking = await prisma.booking.create({
      data: {
        companyId,
        serviceId,
        providerId,
        clientId: client.id,
        startTime: new Date(startTime),
        endTime,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        amount: service.price,
        clientNotes,
      },
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
          },
        },
      },
    })

    return successResponse(
      {
        booking,
        message: 'Booking created. Please proceed with payment.',
      },
      201
    )
  } catch (error) {
    console.error('Error creating booking:', error)

    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        400
      )
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400)
    }

    return errorResponse('Failed to create booking', 500)
  }
}
