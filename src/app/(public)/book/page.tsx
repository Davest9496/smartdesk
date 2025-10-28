import { prisma } from '@/lib/prisma'
import { PublicServiceCard } from '@/components/booking/PublicServiceCard'

interface BookingLandingPageProps {
  searchParams: Promise<{
    companyId?: string
  }>
}

/**
 * Public booking landing page - Browse services
 *
 * Why this approach:
 * - No authentication required
 * - CompanyId in URL for multi-tenancy
 * - Shows only active, public services
 * - Transforms Prisma Decimal to string for client serialization
 *
 * Access: https://yourdomain.com/book?companyId=xxx
 */
export default async function BookingLandingPage({
  searchParams,
}: BookingLandingPageProps) {
  const params = await searchParams
  const companyId = params.companyId

  // Require companyId in URL
  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Booking Link
          </h1>
          <p className="text-gray-600">
            Please use the booking link provided by your service provider.
          </p>
        </div>
      </div>
    )
  }

  // Fetch company details
  const company = await prisma.company.findUnique({
    where: { id: companyId, isActive: true },
    include: {
      settings: true,
    },
  })

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Company Not Found
          </h1>
          <p className="text-gray-600">This booking link is no longer valid.</p>
        </div>
      </div>
    )
  }

  // Fetch public services
  const servicesRaw = await prisma.service.findMany({
    where: {
      companyId,
      isActive: true,
      isPublic: true,
    },
    include: {
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
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  if (servicesRaw.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Services Available
          </h1>
          <p className="text-gray-600">
            {company.name} is not currently accepting bookings.
          </p>
        </div>
      </div>
    )
  }

  // ✅ Transform Prisma data for client serialization
  const services = servicesRaw.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    duration: service.duration,
    price: service.price.toString(), // Convert Decimal to string
    providers: service.providers.map((sp) => ({
      id: sp.provider.id,
      name: sp.provider.name,
      bio: sp.provider.bio,
      imageUrl: sp.provider.imageUrl,
    })),
  }))

  const currency = company.settings?.currency || 'GBP'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600 mt-1">
              Select a service to book your appointment
            </p>
          </div>
        </div>
      </header>

      {/* Services Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <PublicServiceCard
              key={service.id}
              service={service}
              companyId={companyId}
              currency={currency}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
