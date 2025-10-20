'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BookingsFilterProps {
  providers: Array<{ id: string; name: string }>
}

/**
 * Bookings filter component
 *
 * Why URL-based filtering:
 * - Shareable filtered views
 * - Browser back/forward works
 * - Easy to bookmark specific views
 */
export function BookingsFilter({ providers }: BookingsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/dashboard/bookings?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/dashboard/bookings')
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchParams.get('status') || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>

        {/* Provider Filter */}
        <div>
          <Label htmlFor="provider">Provider</Label>
          <select
            id="provider"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchParams.get('providerId') || ''}
            onChange={(e) => handleFilterChange('providerId', e.target.value)}
          >
            <option value="">All Providers</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <Label htmlFor="from">From Date</Label>
          <Input
            id="from"
            type="date"
            value={searchParams.get('from') || ''}
            onChange={(e) => handleFilterChange('from', e.target.value)}
          />
        </div>

        {/* Date To */}
        <div>
          <Label htmlFor="to">To Date</Label>
          <Input
            id="to"
            type="date"
            value={searchParams.get('to') || ''}
            onChange={(e) => handleFilterChange('to', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
