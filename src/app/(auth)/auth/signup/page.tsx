'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FormErrors {
  companyName?: string
  companyEmail?: string
  adminName?: string
  adminEmail?: string
  password?: string
  confirmPassword?: string
}

export default function SignUpPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')

  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Invalid email address'
    }
    if (!emailRegex.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email address'
    }

    if (formData.adminName.trim().length < 2) {
      newErrors.adminName = 'Your name must be at least 2 characters'
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName.trim(),
          companyEmail: formData.companyEmail.trim().toLowerCase(),
          adminName: formData.adminName.trim(),
          adminEmail: formData.adminEmail.trim().toLowerCase(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          const newErrors: FormErrors = {}
          data.details.forEach((detail: { field: string; message: string }) => {
            newErrors[detail.field as keyof FormErrors] = detail.message
          })
          setErrors(newErrors)
        } else {
          setApiError(data.error || 'Failed to create account')
        }
        return
      }

      router.push('/auth/signin?signup=success')
    } catch (error) {
      setApiError(
        'Unable to connect to server. Please check your connection and try again.'
      )
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (apiError) {
      setApiError('')
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">SmartDesk</h1>
        <p className="text-slate-600 mt-2">Professional Booking Management</p>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your company details to get started with SmartDesk
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {apiError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{apiError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Acme Ltd"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  disabled={isLoading}
                  required
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">
                  Company Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyEmail"
                  type="email"
                  placeholder="contact@acme.com"
                  value={formData.companyEmail}
                  onChange={(e) => handleChange('companyEmail', e.target.value)}
                  disabled={isLoading}
                  required
                  className={errors.companyEmail ? 'border-red-500' : ''}
                />
                {errors.companyEmail && (
                  <p className="text-sm text-red-600">{errors.companyEmail}</p>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  Admin Account
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="adminName"
                  type="text"
                  placeholder="John Smith"
                  value={formData.adminName}
                  onChange={(e) => handleChange('adminName', e.target.value)}
                  disabled={isLoading}
                  required
                  className={errors.adminName ? 'border-red-500' : ''}
                />
                {errors.adminName && (
                  <p className="text-sm text-red-600">{errors.adminName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">
                  Your Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="john@acme.com"
                  value={formData.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  className={errors.adminEmail ? 'border-red-500' : ''}
                />
                {errors.adminEmail && (
                  <p className="text-sm text-red-600">{errors.adminEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <PasswordInput
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
                <p className="text-xs text-slate-500">
                  Must be at least 8 characters with uppercase, lowercase, and
                  number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange('confirmPassword', e.target.value)
                  }
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </Button>

            <p className="text-sm text-slate-600 text-center">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="font-medium text-slate-900 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </>
  )
}
