import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BookingCalendar } from '@/components/booking/BookingCalendar'

interface ServiceBookingPageProps {
  params: Promise<{ serviceId: string }>
  searchParams: Promise<{ companyId?: string }>
}

/**
 * Service booking page - Select provider, date, and time
 *
 * Access: /book/[serviceId]?companyId=xxx
 *
 * Why we serialize data:
 * - Server Component can use Prisma types (Decimal)
 * - Client Component needs plain types (number)
 * - Conversion happens at the boundary
 */
export default async function ServiceBookingPage({
  params,
  searchParams,
}: ServiceBookingPageProps) {
  const { serviceId } = await params
  const { companyId } = await searchParams

  if (!companyId) {
    redirect('/book')
  }

  // Fetch service with providers
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      companyId,
      isActive: true,
      isPublic: true,
    },
    include: {
      company: {
        include: {
          settings: true,
        },
      },
      providers: {
        where: {
          provider: {
            isActive: true,
          },
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              bio: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  })

  if (!service) {
    notFound()
  }

  if (service.providers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Service Unavailable
          </h1>
          <p className="text-gray-600">
            This service is temporarily unavailable.
          </p>
        </div>
      </div>
    )
  }

  // ✅ Serialize service data for client component
  // Convert Decimal to number for client-side compatibility
  const serializedService = {
    id: service.id,
    name: service.name,
    description: service.description,
    duration: service.duration,
    price: Number(service.price), // ✅ Decimal → number
  }

  // ✅ Serialize providers data
  const serializedProviders = service.providers.map((sp) => ({
    id: sp.provider.id,
    name: sp.provider.name,
    bio: sp.provider.bio,
    imageUrl: sp.provider.imageUrl,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href={`/book?companyId=${companyId}`}
            className="text-blue-600 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Services
          </a>
          <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
          {service.description && (
            <p className="text-gray-600 mt-2">{service.description}</p>
          )}
          <div className="flex gap-4 mt-4 text-sm text-gray-600">
            <span>⏱️ {service.duration} minutes</span>
            <span>
              💰 {service.company.settings?.currency === 'GBP' && '£'}
              {service.company.settings?.currency === 'USD' && '$'}
              {service.company.settings?.currency === 'EUR' && '€'}
              {Number(service.price).toFixed(2)}
            </span>
          </div>
        </div>
      </header>

      {/* Booking Calendar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BookingCalendar
          service={serializedService}
          providers={serializedProviders}
          companyId={companyId}
        />
      </main>
    </div>
  )
}
