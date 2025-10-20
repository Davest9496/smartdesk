'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  CompanySettings,
  BookingStatus,
  PaymentStatus,
} from '@prisma/client'

/**
 * Serialized booking type with Decimal converted to number
 *
 * Why this approach:
 * - Prisma Decimal type can't be passed to Client Components
 * - We convert to number in Server Component
 * - This type reflects the serialized structure
 */
type BookingWithFullDetails = {
  id: string
  companyId: string
  serviceId: string
  providerId: string
  clientId: string
  startTime: Date
  endTime: Date
  status: BookingStatus
  paymentId: string | null
  amount: number // ✅ Changed from Decimal
  paymentStatus: PaymentStatus
  cancelledAt: Date | null
  cancelledBy: string | null
  cancellationReason: string | null
  clientNotes: string | null
  providerNotes: string | null
  createdAt: Date
  updatedAt: Date
  service: {
    id: string
    companyId: string
    name: string
    description: string | null
    duration: number
    price: number // ✅ Changed from Decimal
    isActive: boolean
    isPublic: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
  }
  provider: {
    id: string
    name: string
    email: string
    bio: string | null
  }
  client: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  company: {
    id: string
    name: string
    settings: CompanySettings | null
  }
}

interface BookingDetailsProps {
  booking: BookingWithFullDetails
  userRole: 'ADMIN' | 'PROVIDER'
}

/**
 * Booking details component
 *
 * Why separate component:
 * - Reusable in different contexts
 * - Handles status updates
 * - Clean separation of concerns
 */
export function BookingDetails({ booking, userRole }: BookingDetailsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    if (
      !confirm(`Are you sure you want to mark this booking as ${newStatus}?`)
    ) {
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          cancelledBy: userRole === 'ADMIN' ? 'admin' : 'provider',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to update booking. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back to Bookings
        </Button>
        <h1 className="text-3xl font-bold">Booking Details</h1>
      </div>

      {/* Main Details Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Service Information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Service Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Service:</span>
                <p className="font-medium">{booking.service.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <p className="font-medium">
                  {booking.service.duration} minutes
                </p>
              </div>
              <div>
                <span className="text-gray-600">Price:</span>
                <p className="font-medium">£{booking.amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-medium">{booking.status}</p>
              </div>
            </div>
          </div>

          <hr />

          {/* Date & Time */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Date & Time</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Date:</span>
                <p className="font-medium">
                  {format(new Date(booking.startTime), 'EEEE, d MMMM yyyy')}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Time:</span>
                <p className="font-medium">
                  {format(new Date(booking.startTime), 'HH:mm')} -{' '}
                  {format(new Date(booking.endTime), 'HH:mm')}
                </p>
              </div>
            </div>
          </div>

          <hr />

          {/* Provider Information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Provider</h2>
            <div className="text-sm space-y-2">
              <p>
                <span className="text-gray-600">Name:</span>{' '}
                <span className="font-medium">{booking.provider.name}</span>
              </p>
              <p>
                <span className="text-gray-600">Email:</span>{' '}
                <span className="font-medium">{booking.provider.email}</span>
              </p>
            </div>
          </div>

          <hr />

          {/* Client Information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Client Information</h2>
            <div className="text-sm space-y-2">
              <p>
                <span className="text-gray-600">Name:</span>{' '}
                <span className="font-medium">{booking.client.name}</span>
              </p>
              <p>
                <span className="text-gray-600">Email:</span>{' '}
                <a
                  href={`mailto:${booking.client.email}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {booking.client.email}
                </a>
              </p>
              {booking.client.phone && (
                <p>
                  <span className="text-gray-600">Phone:</span>{' '}
                  <a
                    href={`tel:${booking.client.phone}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {booking.client.phone}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Client Notes */}
          {booking.clientNotes && (
            <>
              <hr />
              <div>
                <h2 className="text-lg font-semibold mb-3">Client Notes</h2>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded">
                  {booking.clientNotes}
                </p>
              </div>
            </>
          )}

          <hr />

          {/* Payment Information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Payment</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-medium">{booking.paymentStatus}</p>
              </div>
              {booking.paymentId && (
                <div>
                  <span className="text-gray-600">Payment ID:</span>
                  <p className="font-medium font-mono text-xs">
                    {booking.paymentId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      {userRole === 'ADMIN' && booking.status !== 'CANCELLED' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex gap-3">
            {booking.status === 'PENDING' && (
              <Button
                onClick={() => handleStatusUpdate('CONFIRMED')}
                disabled={isUpdating}
              >
                Confirm Booking
              </Button>
            )}
            {booking.status === 'CONFIRMED' && (
              <Button
                onClick={() => handleStatusUpdate('COMPLETED')}
                disabled={isUpdating}
              >
                Mark as Completed
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate('CANCELLED')}
              disabled={isUpdating}
            >
              Cancel Booking
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
