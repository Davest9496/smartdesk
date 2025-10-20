'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'
import type { Booking, Service, Provider, Client } from '@prisma/client'

type BookingWithDetails = Booking & {
  service: Service
  provider: Pick<Provider, 'id' | 'name' | 'email'>
  client: Pick<Client, 'id' | 'name' | 'email' | 'phone'>
}

interface BookingsListProps {
  bookings: BookingWithDetails[]
}

/**
 * Bookings list component
 *
 * Why card-based layout:
 * - Mobile-friendly
 * - Scannable information hierarchy
 * - Quick status identification with badges
 */
export function BookingsList({ bookings }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 text-lg">No bookings found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters or date range
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card
          key={booking.id}
          className="p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-lg">
                  {booking.service.name}
                </h3>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Client:</span>{' '}
                  {booking.client.name}
                </p>
                <p>
                  <span className="font-medium">Provider:</span>{' '}
                  {booking.provider.name}
                </p>
                <p>
                  <span className="font-medium">Time:</span>{' '}
                  {format(
                    new Date(booking.startTime),
                    'EEE, d MMM yyyy • HH:mm'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold">
                  £{Number(booking.amount).toFixed(2)}
                </p>
                <PaymentStatusBadge status={booking.paymentStatus} />
              </div>

              <Link href={`/dashboard/bookings/${booking.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function BookingStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    NO_SHOW: 'bg-gray-100 text-gray-800',
  }

  return (
    <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SUCCEEDED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
  }

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
        variants[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  )
}
