import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface BookingConfirmationPageProps {
  params: Promise<{ bookingId: string }>
}

/**
 * Booking confirmation page
 *
 * Access: /book/confirmation/[bookingId]
 */
export default async function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const { bookingId } = await params

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      provider: {
        select: {
          name: true,
          email: true,
        },
      },
      client: {
        select: {
          name: true,
          email: true,
        },
      },
      company: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!booking) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              A confirmation email has been sent to {booking.client.email}
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Booking Details</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{booking.service.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">{booking.provider.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {format(new Date(booking.startTime), 'EEEE, d MMMM yyyy')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {format(new Date(booking.startTime), 'HH:mm')} -{' '}
                    {format(new Date(booking.endTime), 'HH:mm')}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-bold text-lg">
                    £{Number(booking.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">
                Need to Make Changes?
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                To reschedule or cancel your appointment, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Email:</span>{' '}
                  <a
                    href={`mailto:${booking.company.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {booking.company.email}
                  </a>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <Link href={`/book?companyId=${booking.companyId}`}>
                <Button className="w-full">Book Another Appointment</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
