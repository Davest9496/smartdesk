import type { Company, CompanySettings } from '@prisma/client'

/**
 * Company with settings
 */
export type CompanyWithSettings = Company & {
  settings: CompanySettings | null
}

/**
 * Public company profile (safe for client-side)
 */
export type PublicCompanyProfile = Pick<
  Company,
  'id' | 'name' | 'subdomain' | 'createdAt'
>

/**
 * Company settings update payload
 */
export interface CompanySettingsUpdate {
  timeZone?: string
  currency?: string
  dateFormat?: string
  brandColour?: string
  logoUrl?: string | null
  bufferTime?: number
  minAdvance?: number
  maxAdvance?: number
}

/**
 * Company profile update payload
 */
export interface CompanyProfileUpdate {
  name?: string
  email?: string
  subdomain?: string | null
}
