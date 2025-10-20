import type {
  Booking,
  Service,
  Provider,
  Client,
  Company,
} from '@prisma/client'

export type BookingWithDetails = Booking & {
  service: Service
  provider: Pick<Provider, 'id' | 'name' | 'email' | 'bio'>
  client: Pick<Client, 'id' | 'name' | 'email' | 'phone'>
  company: Pick<Company, 'id' | 'name' | 'email'>
}

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

export interface BookingConfirmation {
  bookingId: string
  serviceName: string
  providerName: string
  startTime: string
  endTime: string
  amount: number
  clientEmail: string
}
