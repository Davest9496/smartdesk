import { z } from 'zod'

/**
 * Company settings update schema
 * Only includes fields that can be modified after creation
 */
export const companySettingsUpdateSchema = z.object({
  // Localisation
  timeZone: z.string().optional(),
  currency: z.string().length(3).optional(), // ISO 4217 currency codes (GBP, USD, EUR)
  dateFormat: z.string().optional(),

  // Branding
  brandColour: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Must be valid hex colour')
    .optional(),
  logoUrl: z.string().url().optional().nullable(),

  // Booking configuration
  bufferTime: z
    .number()
    .int()
    .min(0, 'Buffer time cannot be negative')
    .max(120, 'Buffer time cannot exceed 120 minutes')
    .optional(),
  minAdvance: z
    .number()
    .int()
    .min(0, 'Minimum advance time cannot be negative')
    .max(10080, 'Minimum advance time cannot exceed 1 week')
    .optional(),
  maxAdvance: z
    .number()
    .int()
    .min(60, 'Maximum advance time must be at least 1 hour')
    .max(525600, 'Maximum advance time cannot exceed 1 year')
    .optional(),
})

/**
 * Company profile update schema
 */
export const companyProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain cannot exceed 63 characters')
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens'
    )
    .optional()
    .nullable(),
})

/**
 * Supported timezones for validation
 * Based on IANA timezone database
 */
export const SUPPORTED_TIMEZONES = [
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
] as const

/**
 * Supported currencies
 */
export const SUPPORTED_CURRENCIES = ['GBP', 'USD', 'EUR'] as const
