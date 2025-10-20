import type { BookingStatus, PaymentStatus } from '@prisma/client'

/**
 * Provider for booking display
 */
export type BookingProvider = {
  id: string
  name: string
  email: string
  bio?: string | null
}

/**
 * Client for booking display
 */
export type BookingClient = {
  id: string
  name: string
  email: string
  phone: string | null
}

/**
 * Company for booking display
 */
export type BookingCompany = {
  id: string
  name: string
  settings: {
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
    createdAt: Date
    updatedAt: Date
  } | null
}

/**
 * Serialized service type - Decimal fields converted to number
 * Used when passing from Server Components to Client Components
 */
export type SerializedService = {
  id: string
  companyId: string
  name: string
  description: string | null
  duration: number
  price: number // ✅ Decimal converted to number
  isActive: boolean
  isPublic: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Serialized booking type - Decimal fields converted to number
 * Used for passing data from Server to Client Components
 */
export type SerializedBooking = {
  id: string
  companyId: string
  serviceId: string
  providerId: string
  clientId: string
  startTime: Date
  endTime: Date
  status: BookingStatus
  paymentId: string | null
  amount: number // ✅ Decimal converted to number
  paymentStatus: PaymentStatus
  cancelledAt: Date | null
  cancelledBy: string | null
  cancellationReason: string | null
  clientNotes: string | null
  providerNotes: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Booking with full details for dashboard view
 */
export type BookingWithFullDetails = SerializedBooking & {
  service: SerializedService
  provider: BookingProvider
  client: BookingClient
  company: BookingCompany
}

/**
 * Booking with details for list view
 * This is what BookingsList component expects
 *
 * Why we use Partial<SerializedService>:
 * - The spread operator in the page includes ALL service fields
 * - TypeScript needs to know these extra fields are allowed
 * - Using intersection type ensures type safety
 */
export type BookingWithDetails = Omit<SerializedBooking, 'service'> & {
  service: SerializedService
  provider: Omit<BookingProvider, 'bio'> & { bio?: string | null }
  client: BookingClient
}

/**
 * Booking form data (client input)
 */
export interface BookingFormData {
  serviceId: string
  providerId: string
  companyId: string
  startTime: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientNotes?: string
}

/**
 * Booking confirmation data
 */
export interface BookingConfirmation {
  bookingId: string
  serviceName: string
  providerName: string
  startTime: string
  endTime: string
  amount: number
  clientEmail: string
}
