import { prisma } from '@/lib/prisma'
import { addMinutes, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { parseTimeString } from './time-utils'

export interface TimeSlot {
  startTime: Date
  endTime: Date
  available: boolean
}

export interface AvailabilityParams {
  providerId: string
  serviceId: string
  date: Date
  companyId: string
}

/**
 * Calculate available time slots for a provider on a specific date
 *
 * Algorithm:
 * 1. Fetch service details (duration)
 * 2. Fetch provider's working hours for this day of week
 * 3. Fetch existing bookings for this provider on this date
 * 4. Generate all possible slots within working hours
 * 5. Filter out slots that overlap with existing bookings
 * 6. Apply buffer time from company settings
 *
 * @throws Error if service not found or doesn't belong to company
 */
export async function calculateAvailableSlots({
  providerId,
  serviceId,
  date,
  companyId,
}: AvailabilityParams): Promise<TimeSlot[]> {
  // 1. Validate service exists and belongs to company
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      companyId,
      isActive: true,
    },
  })

  if (!service) {
    throw new Error('Service not found or inactive')
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
    throw new Error('Provider not assigned to this service')
  }

  // 3. Get company settings for buffer time
  const companySettings = await prisma.companySettings.findUnique({
    where: { companyId },
    select: {
      bufferTime: true,
      minAdvance: true,
      maxAdvance: true,
    },
  })

  const bufferTime = companySettings?.bufferTime || 0
  const minAdvance = companySettings?.minAdvance || 60
  const maxAdvance = companySettings?.maxAdvance || 10080

  // 4. Check if date is within allowed booking window
  const now = new Date()
  const minutesUntilDate = (date.getTime() - now.getTime()) / (1000 * 60)

  if (minutesUntilDate < minAdvance) {
    return [] // Too soon to book
  }

  if (minutesUntilDate > maxAdvance) {
    return [] // Too far in advance
  }

  // 5. Get working hours for this day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = date.getDay()
  const workingHours = await prisma.workingHours.findMany({
    where: {
      providerId,
      dayOfWeek,
    },
    orderBy: { startTime: 'asc' },
  })

  if (workingHours.length === 0) {
    return [] // Provider doesn't work on this day
  }

  // 6. Get existing bookings for this provider on this date
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const existingBookings = await prisma.booking.findMany({
    where: {
      providerId,
      companyId,
      startTime: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'], // Only block slots for active bookings
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
    orderBy: { startTime: 'asc' },
  })

  // 7. Generate all possible slots
  const allSlots: TimeSlot[] = []
  const slotIntervalMinutes = 15 // Generate slots every 15 minutes

  for (const hours of workingHours) {
    const workStart = parseTimeString(hours.startTime, date)
    const workEnd = parseTimeString(hours.endTime, date)

    let currentSlotStart = workStart

    while (currentSlotStart < workEnd) {
      // Calculate when this service would end if started at currentSlotStart
      const slotEnd = addMinutes(currentSlotStart, service.duration)

      // Only consider this slot if the entire service duration fits within working hours
      if (slotEnd <= workEnd) {
        // Check if slot is in the past
        const isPast = currentSlotStart < now

        // Check if slot conflicts with any existing booking (with buffer)
        const hasConflict = existingBookings.some((booking) => {
          // Add buffer time to the booking's end time
          const bookingEndWithBuffer = addMinutes(booking.endTime, bufferTime)

          // Check for overlap
          return (
            // Slot starts during an existing booking
            isWithinInterval(currentSlotStart, {
              start: booking.startTime,
              end: bookingEndWithBuffer,
            }) ||
            // Slot ends during an existing booking
            isWithinInterval(slotEnd, {
              start: booking.startTime,
              end: bookingEndWithBuffer,
            }) ||
            // Slot completely contains an existing booking
            (currentSlotStart <= booking.startTime &&
              slotEnd >= bookingEndWithBuffer)
          )
        })

        allSlots.push({
          startTime: new Date(currentSlotStart),
          endTime: new Date(slotEnd),
          available: !isPast && !hasConflict,
        })
      }

      // Move to next potential slot
      currentSlotStart = addMinutes(currentSlotStart, slotIntervalMinutes)
    }
  }

  // 8. Return only available slots
  return allSlots.filter((slot) => slot.available)
}

/**
 * Get availability for multiple days (e.g., for a calendar view)
 */
export async function calculateAvailabilityForDateRange({
  providerId,
  serviceId,
  startDate,
  endDate,
  companyId,
}: {
  providerId: string
  serviceId: string
  startDate: Date
  endDate: Date
  companyId: string
}): Promise<Map<string, TimeSlot[]>> {
  const availabilityMap = new Map<string, TimeSlot[]>()
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0] // YYYY-MM-DD format
    const slots = await calculateAvailableSlots({
      providerId,
      serviceId,
      date: new Date(currentDate),
      companyId,
    })

    availabilityMap.set(dateKey, slots)

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return availabilityMap
}
