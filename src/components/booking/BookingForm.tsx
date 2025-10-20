'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateBookingInput } from '@/lib/validations/booking'

interface BookingFormProps {
  serviceId: string
  providerId: string
  companyId: string
  startTime: Date
  onSubmit: (data: CreateBookingInput) => Promise<void>
}

/**
 * Booking form component
 *
 * Why separate form:
 * - Client details collection
 * - Validation before API call
 * - Reusable across different booking flows
 */
export function BookingForm({
  serviceId,
  providerId,
  companyId,
  startTime,
  onSubmit,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientNotes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        serviceId,
        providerId,
        companyId,
        startTime: startTime.toISOString(),
        ...formData,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="clientName">Full Name *</Label>
          <Input
            id="clientName"
            type="text"
            required
            value={formData.clientName}
            onChange={(e) =>
              setFormData({ ...formData, clientName: e.target.value })
            }
            placeholder="John Smith"
          />
        </div>

        <div>
          <Label htmlFor="clientEmail">Email Address *</Label>
          <Input
            id="clientEmail"
            type="email"
            required
            value={formData.clientEmail}
            onChange={(e) =>
              setFormData({ ...formData, clientEmail: e.target.value })
            }
            placeholder="john@example.com"
          />
        </div>

        <div>
          <Label htmlFor="clientPhone">Phone Number (Optional)</Label>
          <Input
            id="clientPhone"
            type="tel"
            value={formData.clientPhone}
            onChange={(e) =>
              setFormData({ ...formData, clientPhone: e.target.value })
            }
            placeholder="+44 7700 900000"
          />
        </div>

        <div>
          <Label htmlFor="clientNotes">Additional Notes (Optional)</Label>
          <textarea
            id="clientNotes"
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.clientNotes}
            onChange={(e) =>
              setFormData({ ...formData, clientNotes: e.target.value })
            }
            placeholder="Any special requests or information we should know..."
            maxLength={500}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
      </Button>
    </form>
  )
}
