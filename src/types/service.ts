import type { Service, Provider } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Service with assigned providers
 */
export type ServiceWithProviders = Service & {
  providers: Array<{
    provider: Provider
    assignedAt: Date
  }>
}

/**
 * Public service (for booking page)
 */
export type PublicService = Pick<
  Service,
  'id' | 'name' | 'description' | 'duration' | 'price'
>

/**
 * Service creation payload
 */
export interface CreateServiceInput {
  name: string
  description?: string
  duration: number // minutes
  price: number | Decimal
  isPublic?: boolean
  sortOrder?: number
}

/**
 * Service update payload
 */
export interface UpdateServiceInput {
  name?: string
  description?: string
  duration?: number
  price?: number | Decimal
  isActive?: boolean
  isPublic?: boolean
  sortOrder?: number
}
