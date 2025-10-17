'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/icons'

interface CompanyProfile {
  id: string
  name: string
  email: string
  subdomain: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface FormErrors {
  name?: string
  email?: string
  subdomain?: string
}

export default function CompanyProfileForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subdomain: '',
  })

  // Fetch company profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/company/profile')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load profile')
        }

        setProfile(data.data)
        setFormData({
          name: data.data.name,
          email: data.data.email,
          subdomain: data.data.subdomain || '',
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        setErrorMessage('Failed to load company profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  function handleChange(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Clear messages
    setSuccessMessage('')
    setErrorMessage('')
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (formData.subdomain) {
      const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
      if (!subdomainRegex.test(formData.subdomain)) {
        newErrors.subdomain =
          'Subdomain must contain only lowercase letters, numbers, and hyphens'
      } else if (formData.subdomain.length < 3) {
        newErrors.subdomain = 'Subdomain must be at least 3 characters'
      } else if (formData.subdomain.length > 63) {
        newErrors.subdomain = 'Subdomain cannot exceed 63 characters'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/company/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subdomain: formData.subdomain.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          const newErrors: FormErrors = {}
          data.details.forEach(
            (detail: { path: string[]; message: string }) => {
              const field = detail.path[0] as keyof FormErrors
              newErrors[field] = detail.message
            }
          )
          setErrors(newErrors)
        } else {
          setErrorMessage(data.error || 'Failed to update profile')
        }
        return
      }

      setSuccessMessage('Company profile updated successfully')
      setProfile(data.data)
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">Failed to load company profile</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={isSaving}
          className={errors.name ? 'border-red-500' : ''}
          required
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Company Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Company Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={isSaving}
          className={errors.email ? 'border-red-500' : ''}
          required
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        <p className="text-xs text-slate-500">
          Primary contact email for your company
        </p>
      </div>

      {/* Subdomain */}
      <div className="space-y-2">
        <Label htmlFor="subdomain">Subdomain (Optional)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="subdomain"
            type="text"
            value={formData.subdomain}
            onChange={(e) => handleChange('subdomain', e.target.value)}
            disabled={isSaving}
            className={errors.subdomain ? 'border-red-500' : ''}
            placeholder="your-company"
          />
          <span className="text-sm text-slate-500 whitespace-nowrap">
            .smartdesk.com
          </span>
        </div>
        {errors.subdomain && (
          <p className="text-sm text-red-600">{errors.subdomain}</p>
        )}
        <p className="text-xs text-slate-500">
          Custom subdomain for your booking page (e.g., acme.smartdesk.com)
        </p>
      </div>

      {/* Account Status */}
      <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Account Status</p>
            <p className="text-xs text-slate-500 mt-1">
              Account created on{' '}
              {new Date(profile.createdAt).toLocaleDateString('en-GB')}
            </p>
          </div>
          <div>
            {profile.isActive ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner className="h-4 w-4" />
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}
