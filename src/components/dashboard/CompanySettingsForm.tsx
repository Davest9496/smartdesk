'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/icons'

interface CompanySettings {
  id: string
  companyId: string
  timeZone: string
  currency: string
  dateFormat: string
  brandColour: string
  logoUrl: string | null
  bufferTime: number
  minAdvance: number
  maxAdvance: number
  createdAt: string
  updatedAt: string
}

interface FormErrors {
  timeZone?: string
  currency?: string
  dateFormat?: string
  brandColour?: string
  bufferTime?: string
  minAdvance?: string
  maxAdvance?: string
}

const TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
]

const CURRENCIES = [
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
]

export default function CompanySettingsForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    timeZone: 'Europe/London',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    brandColour: '#000000',
    bufferTime: 0,
    minAdvance: 60,
    maxAdvance: 10080,
  })

  // Fetch company settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/company/settings')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load settings')
        }

        setSettings(data.data)
        setFormData({
          timeZone: data.data.timeZone,
          currency: data.data.currency,
          dateFormat: data.data.dateFormat,
          brandColour: data.data.brandColour,
          bufferTime: data.data.bufferTime,
          minAdvance: data.data.minAdvance,
          maxAdvance: data.data.maxAdvance,
        })
      } catch (error) {
        console.error('Error fetching settings:', error)
        setErrorMessage('Failed to load company settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  function handleChange(field: keyof typeof formData, value: string | number) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    setSuccessMessage('')
    setErrorMessage('')
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    // Validate hex colour
    if (!/^#[0-9A-F]{6}$/i.test(formData.brandColour)) {
      newErrors.brandColour = 'Must be a valid hex colour (e.g., #000000)'
    }

    // Validate buffer time
    if (formData.bufferTime < 0 || formData.bufferTime > 120) {
      newErrors.bufferTime = 'Buffer time must be between 0 and 120 minutes'
    }

    // Validate min advance
    if (formData.minAdvance < 0 || formData.minAdvance > 10080) {
      newErrors.minAdvance =
        'Minimum advance time must be between 0 and 10,080 minutes (1 week)'
    }

    // Validate max advance
    if (formData.maxAdvance < 60 || formData.maxAdvance > 525600) {
      newErrors.maxAdvance =
        'Maximum advance time must be between 60 minutes and 525,600 minutes (1 year)'
    }

    // Ensure max advance is greater than min advance
    if (formData.maxAdvance <= formData.minAdvance) {
      newErrors.maxAdvance =
        'Maximum advance time must be greater than minimum advance time'
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
      const response = await fetch('/api/company/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
          setErrorMessage(data.error || 'Failed to update settings')
        }
        return
      }

      setSuccessMessage('Settings updated successfully')
      setSettings(data.data)
      router.refresh()
    } catch (error) {
      console.error('Error updating settings:', error)
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

  if (!settings) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">Failed to load settings</p>
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

      {/* Localisation Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-900">Localisation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timeZone">Timezone</Label>
            <Select
              id="timeZone"
              value={formData.timeZone}
              onChange={(e) => handleChange('timeZone', e.target.value)}
              disabled={isSaving}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              disabled={isSaving}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Branding Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-900">Branding</h3>

        <div className="space-y-2">
          <Label htmlFor="brandColour">Brand Colour</Label>
          <div className="flex items-center gap-3">
            <Input
              id="brandColour"
              type="color"
              value={formData.brandColour}
              onChange={(e) => handleChange('brandColour', e.target.value)}
              disabled={isSaving}
              className="w-20 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={formData.brandColour}
              onChange={(e) => handleChange('brandColour', e.target.value)}
              disabled={isSaving}
              className={`flex-1 ${errors.brandColour ? 'border-red-500' : ''}`}
              placeholder="#000000"
            />
          </div>
          {errors.brandColour && (
            <p className="text-sm text-red-600">{errors.brandColour}</p>
          )}
          <p className="text-xs text-slate-500">
            Used for buttons and accents on your booking page
          </p>
        </div>
      </div>

      {/* Booking Configuration Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-900">
          Booking Configuration
        </h3>

        <div className="space-y-4">
          {/* Buffer Time */}
          <div className="space-y-2">
            <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
            <Input
              id="bufferTime"
              type="number"
              min="0"
              max="120"
              value={formData.bufferTime}
              onChange={(e) =>
                handleChange('bufferTime', parseInt(e.target.value) || 0)
              }
              disabled={isSaving}
              className={errors.bufferTime ? 'border-red-500' : ''}
            />
            {errors.bufferTime && (
              <p className="text-sm text-red-600">{errors.bufferTime}</p>
            )}
            <p className="text-xs text-slate-500">
              Time gap between appointments (0-120 minutes)
            </p>
          </div>

          {/* Minimum Advance Time */}
          <div className="space-y-2">
            <Label htmlFor="minAdvance">Minimum Advance Time (minutes)</Label>
            <Input
              id="minAdvance"
              type="number"
              min="0"
              max="10080"
              value={formData.minAdvance}
              onChange={(e) =>
                handleChange('minAdvance', parseInt(e.target.value) || 0)
              }
              disabled={isSaving}
              className={errors.minAdvance ? 'border-red-500' : ''}
            />
            {errors.minAdvance && (
              <p className="text-sm text-red-600">{errors.minAdvance}</p>
            )}
            <p className="text-xs text-slate-500">
              How far in advance clients must book (e.g., 60 = 1 hour ahead)
            </p>
          </div>

          {/* Maximum Advance Time */}
          <div className="space-y-2">
            <Label htmlFor="maxAdvance">Maximum Advance Time (minutes)</Label>
            <Input
              id="maxAdvance"
              type="number"
              min="60"
              max="525600"
              value={formData.maxAdvance}
              onChange={(e) =>
                handleChange('maxAdvance', parseInt(e.target.value) || 0)
              }
              disabled={isSaving}
              className={errors.maxAdvance ? 'border-red-500' : ''}
            />
            {errors.maxAdvance && (
              <p className="text-sm text-red-600">{errors.maxAdvance}</p>
            )}
            <p className="text-xs text-slate-500">
              How far in the future clients can book (e.g., 10,080 = 1 week)
            </p>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-900 mb-2">
            Quick Reference
          </p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• 60 minutes = 1 hour</li>
            <li>• 1,440 minutes = 1 day</li>
            <li>• 10,080 minutes = 1 week</li>
            <li>• 43,200 minutes = 1 month (30 days)</li>
          </ul>
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
            'Save Settings'
          )}
        </Button>
      </div>
    </form>
  )
}
