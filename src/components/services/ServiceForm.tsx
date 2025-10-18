'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createServiceSchema,
  type CreateServiceInput,
} from '@/lib/validations/service'

interface ServiceFormProps {
  initialData?: Partial<CreateServiceInput>
  serviceId?: string
  onSuccess?: () => void
}

export function ServiceForm({
  initialData,
  serviceId,
  onSuccess,
}: ServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      isPublic: true,
      sortOrder: 0,
      ...initialData,
    },
  })

  const onSubmit = async (data: CreateServiceInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = serviceId ? `/api/services/${serviceId}` : '/api/services'
      const method = serviceId ? 'PATCH' : 'POST'

      // Transform empty description to undefined
      const payload = {
        ...data,
        description: data.description?.trim() || undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save service')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/services')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {serviceId ? 'Edit Service' : 'Create New Service'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input id="name" {...register('name')} placeholder="Haircut" />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the service..."
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="60"
              />
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price (£) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="50.00"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              type="checkbox"
              {...register('isPublic')}
              className="h-4 w-4"
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Show on public booking page
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : serviceId ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
