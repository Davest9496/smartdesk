import type { Prisma } from '@prisma/client'

export type CompanyWithRelations = Prisma.CompanyGetPayload<{
  include: {
    settings: true
    users: true
    providers: true
    services: true
  }
}>

export type ServiceWithProviders = Prisma.ServiceGetPayload<{
  include: {
    providers: {
      include: {
        provider: true
      }
    }
  }
}>

export type BookingWithDetails = Prisma.BookingGetPayload<{
  include: {
    service: true
    provider: true
    client: true
  }
}>

export type ProviderWithServices = Prisma.ProviderGetPayload<{
  include: {
    services: {
      include: {
        service: true
      }
    }
    workingHours: true
  }
}>

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
