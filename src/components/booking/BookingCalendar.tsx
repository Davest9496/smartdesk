'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker'
import { BookingForm } from '@/components/booking/BookingForm'
import type { CreateBookingInput } from '@/lib/validations/booking'
import { useRouter } from 'next/navigation'

// ✅ Local type definitions (not importing from Prisma client-side)
type ServiceProp = {
  id: string
  name: string
  duration: number
  price: number
}

type ProviderProp = {
  id: string
  name: string
  bio: string | null
  imageUrl: string | null
}

interface BookingCalendarProps {
  service: ServiceProp
  providers: ProviderProp[]
  companyId: string
}

/**
 * Booking calendar component - handles provider selection, date/time, and booking
 *
 * Why this structure:
 * - Step-by-step flow (provider → date → time → details)
 * - Clear visual progress
 * - Mobile-friendly
 */
export function BookingCalendar({
  service,
  providers,
  companyId,
}: BookingCalendarProps) {
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)

  type AvailableSlot = {
    startTime: Date
    endTime: Date
    available: boolean
  }

  // API slot shape returned from /api/availability
  type ApiSlot = {
    startTime: string
    endTime: string
    available?: boolean
  }

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)

  // Step 1: Provider selection
  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
    setSelectedDate(null)
    setSelectedTime(null)
    setAvailableSlots([])
  }

  // Step 2: Date selection
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setIsLoadingSlots(true)

    if (!selectedProvider) {
      setAvailableSlots([])
      setIsLoadingSlots(false)
      return
    }

    try {
      // ✅ No companyId needed - API derives it from serviceId
      const response = await fetch(
        `/api/availability?providerId=${encodeURIComponent(
          selectedProvider
        )}&date=${encodeURIComponent(date.toISOString())}&serviceId=${encodeURIComponent(
          service.id
        )}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch availability')
      }

      const data = await response.json()
      setAvailableSlots(
        data.data.availableSlots.map((slot: ApiSlot) => ({
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          available: slot.available ?? true,
        }))
      )
    } catch (error) {
      console.error('Error fetching availability:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to load available times. Please try again.'
      )
    } finally {
      setIsLoadingSlots(false)
    }
  }

  // Step 3: Time slot selection
  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time)
    setShowBookingForm(true)
  }

  // Step 4: Submit booking
  const handleBookingSubmit = async (data: CreateBookingInput) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create booking')
      }

      const result = await response.json()

      // For MVP, redirect to confirmation (payment integration in Phase 8)
      router.push(`/book/confirmation/${result.data.booking.id}`)
    } catch (error) {
      console.error('Booking error:', error)
      throw error
    }
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Select Provider */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Select Provider</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderSelect(provider.id)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedProvider === provider.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold">{provider.name}</h3>
              {provider.bio && (
                <p className="text-sm text-gray-600 mt-1">{provider.bio}</p>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Step 2: Select Date */}
      {selectedProvider && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Select Date</h2>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleDateSelect(new Date(e.target.value))}
          />
        </Card>
      )}

      {/* Step 3: Select Time */}
      {selectedDate && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Step 3: Select Time</h2>
          {isLoadingSlots ? (
            <p className="text-gray-600">Loading available times...</p>
          ) : (
            <TimeSlotPicker
              slots={availableSlots}
              selectedSlot={selectedTime}
              onSlotSelect={handleTimeSelect}
            />
          )}
        </Card>
      )}

      {/* Step 4: Booking Form */}
      {showBookingForm && selectedTime && selectedProvider && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Step 4: Your Details</h2>
          <BookingForm
            serviceId={service.id}
            providerId={selectedProvider}
            companyId={companyId}
            startTime={selectedTime}
            onSubmit={handleBookingSubmit}
          />
        </Card>
      )}
    </div>
  )
}
