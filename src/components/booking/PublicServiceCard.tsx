'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'

interface PublicServiceCardProps {
  service: {
    id: string
    name: string
    description: string | null
    duration: number
    price: string // ✅ Now a string (from Decimal.toString())
    providers: Array<{
      id: string
      name: string
      bio: string | null
      imageUrl: string | null
    }>
  }
  companyId: string
  currency: string
}

/**
 * Public-facing service card for client booking flow
 *
 * Why this approach:
 * - Client component for interactivity (navigation)
 * - Receives serialized data (no Prisma Decimal)
 * - No admin actions (edit/delete)
 * - Focuses on booking journey
 */
export function PublicServiceCard({
  service,
  companyId,
  currency,
}: PublicServiceCardProps) {
  const router = useRouter()

  const formatPrice = (priceString: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(Number(priceString))
  }

  const handleBookNow = () => {
    router.push(`/book/${service.id}?companyId=${companyId}`)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{service.name}</CardTitle>
        <p className="text-2xl font-bold text-blue-600">
          {formatPrice(service.price)}
        </p>
      </CardHeader>
      <CardContent>
        {service.description && (
          <p className="text-sm text-gray-600 mb-4">{service.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {service.duration} mins
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {service.providers.length} provider
            {service.providers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Available Providers */}
        {service.providers.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Available with:
            </p>
            <div className="flex flex-wrap gap-2">
              {service.providers.slice(0, 3).map((provider) => (
                <span
                  key={provider.id}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {provider.name}
                </span>
              ))}
              {service.providers.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{service.providers.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <Button onClick={handleBookNow} className="w-full">
          Book Now
        </Button>
      </CardContent>
    </Card>
  )
}
