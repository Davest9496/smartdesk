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
  createProviderSchema,
  type CreateProviderInput,
} from '@/lib/validations/provider'

interface ProviderFormProps {
  initialData?: Partial<CreateProviderInput>
  providerId?: string
  onSuccess?: () => void
}

export function ProviderForm({
  initialData,
  providerId,
  onSuccess,
}: ProviderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProviderInput>({
    resolver: zodResolver(createProviderSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: CreateProviderInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = providerId ? `/api/providers/${providerId}` : '/api/providers'
      const method = providerId ? 'PATCH' : 'POST'

      // Clean up optional fields
      const payload = {
        ...data,
        bio: data.bio?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save provider')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/providers')
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
          {providerId ? 'Edit Provider' : 'Create New Provider'}
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
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name')} placeholder="John Smith" />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              {...register('bio')}
              placeholder="Brief description about this provider..."
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
            />
            {errors.bio && (
              <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              {...register('imageUrl')}
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-600 mt-1">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : providerId ? 'Update' : 'Create'}
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
