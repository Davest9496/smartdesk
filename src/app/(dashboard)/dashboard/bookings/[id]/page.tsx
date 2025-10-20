import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BookingDetails } from '@/components/dashboard/BookingDetails'
import { withTenantIsolation } from '@/lib/tenant-context'

interface BookingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  const { id } = await params
  const companyId = session.user.companyId

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
          settings: true,
        },
      },
    },
  })

  if (!booking) {
    notFound()
  }

  // Verify tenant isolation
  try {
    withTenantIsolation(booking, companyId)
  } catch {
    notFound()
  }

  // ✅ Convert Decimal to number for Client Components
  const serializedBooking = {
    ...booking,
    amount: booking.amount.toNumber(),
    service: {
      ...booking.service,
      price: booking.service.price.toNumber(),
    },
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BookingDetails
        booking={serializedBooking}
        userRole={session.user.role}
      />
    </div>
  )
}
