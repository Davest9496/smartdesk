'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/availability/time-utils'
import type { Service } from '@prisma/client'
import Link from 'next/link'

interface ServiceCardProps {
  service: Service & {
    providers: Array<{
      provider: {
        id: string
        name: string
        bio: string | null
      }
    }>
  }
  companyId: string
  currency: string
}

/**
 * Service card component for public booking page
 *
 * Why this design:
 * - Shows essential info: name, duration, price
 * - Provider count builds trust
 * - Clear CTA button
 * - Mobile-friendly card layout
 */
export function ServiceCard({
  service,
  companyId,
  currency,
}: ServiceCardProps) {
  const providerCount = service.providers.length

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{service.name}</h3>
          {service.description && (
            <p className="text-gray-600 mt-2 text-sm">{service.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatDuration(service.duration)}</span>
          <span>
            {providerCount} provider{providerCount !== 1 ? 's' : ''} available
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {currency === 'GBP' && '£'}
            {currency === 'USD' && '$'}
            {currency === 'EUR' && '€'}
            {Number(service.price).toFixed(2)}
          </span>

          <Link href={`/book/${service.id}?companyId=${companyId}`}>
            <Button>Book Now</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
