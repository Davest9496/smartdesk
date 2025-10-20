import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'
import { BookingsList } from '@/components/dashboard/BookingsList'
import { BookingsFilter } from '@/components/dashboard/BookingsFilter'
import { startOfDay, endOfDay, addDays } from 'date-fns'
import type { BookingWithDetails } from '@/types/booking'

interface BookingsPageProps {
  searchParams: Promise<{
    status?: string
    providerId?: string
    from?: string
    to?: string
  }>
}

/**
 * Bookings dashboard page
 *
 * Why this structure:
 * - Server-side data fetching for performance
 * - URL-based filtering (shareable URLs)
 * - Real-time data (no stale cache)
 * - Serialization for client components (Decimal → number)
 */
export default async function BookingsPage({
  searchParams,
}: BookingsPageProps) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  const params = await searchParams
  const companyId = session.user.companyId

  // Build filter conditions
  const isBookingStatus = (s: string): s is BookingStatus =>
    Object.values(BookingStatus).includes(s as BookingStatus)

  const statusFilter =
    params.status && isBookingStatus(params.status)
      ? { status: params.status }
      : {}

  const providerFilter = params.providerId
    ? { providerId: params.providerId }
    : {}

  // Date range filter (default: next 30 days)
  const fromDate = params.from ? new Date(params.from) : startOfDay(new Date())
  const toDate = params.to
    ? new Date(params.to)
    : endOfDay(addDays(new Date(), 30))

  const dateFilter = {
    startTime: {
      gte: fromDate,
      lte: toDate,
    },
  }

  // Fetch bookings with filters
  const bookings = await prisma.booking.findMany({
    where: {
      companyId,
      ...statusFilter,
      ...providerFilter,
      ...dateFilter,
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
          phone: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  })

  // Fetch providers for filter dropdown
  const providers = await prisma.provider.findMany({
    where: {
      companyId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })

  // ✅ Serialize bookings for client component
  // Convert Decimal fields to numbers (amount and service.price)
  // Type assertion needed because spread operator includes extra Prisma metadata
  const serializedBookings = bookings.map((booking) => ({
    ...booking,
    amount: Number(booking.amount), // Decimal → number
    service: {
      ...booking.service,
      price: Number(booking.service.price), // Decimal → number
    },
  })) as BookingWithDetails[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-gray-600 mt-2">
          Manage and view all bookings for your company
        </p>
      </div>

      <BookingsFilter providers={providers} />

      <BookingsList bookings={serializedBookings} />
    </div>
  )
}
