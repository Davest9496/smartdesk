'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface Provider {
  id: string
  name: string
  email: string
  isActive: boolean
}

interface ProviderAssignmentProps {
  serviceId: string
  currentProviderIds: string[]
  onSave: () => void
}

export function ProviderAssignment({
  serviceId,
  currentProviderIds,
  onSave,
}: ProviderAssignmentProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(currentProviderIds)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers')
      const result = await response.json()

      if (response.ok) {
        setProviders(result.data.filter((p: Provider) => p.isActive))
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleProvider = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (selectedIds.length === 0) {
      setError('Please select at least one provider')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/services/${serviceId}/providers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerIds: selectedIds }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign providers')
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p>Loading providers...</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Providers</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active providers found. Create providers first.
            </p>
          ) : (
            <div className="space-y-2">
              {providers.map((provider) => (
                <div key={provider.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`provider-${provider.id}`}
                    checked={selectedIds.includes(provider.id)}
                    onChange={() => toggleProvider(provider.id)}
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor={`provider-${provider.id}`}
                    className="cursor-pointer flex-1"
                  >
                    <span className="font-medium">{provider.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({provider.email})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || providers.length === 0}
            >
              {isSubmitting ? 'Saving...' : 'Save Assignments'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
