import type { Provider, WorkingHours, Service } from '@prisma/client'

/**
 * Provider with all relations
 */
export type ProviderWithRelations = Provider & {
  services: Array<{
    service: Service
    assignedAt: Date
  }>
  workingHours: WorkingHours[]
}

/**
 * Public provider profile (safe for client-facing pages)
 */
export type PublicProviderProfile = Pick<
  Provider,
  'id' | 'name' | 'bio' | 'imageUrl'
>

/**
 * Provider creation payload
 */
export interface CreateProviderInput {
  name: string
  email: string
  bio?: string
  imageUrl?: string
}

/**
 * Provider update payload
 */
export interface UpdateProviderInput {
  name?: string
  email?: string
  bio?: string
  imageUrl?: string
  isActive?: boolean
}

/**
 * Working hours payload
 */
export interface WorkingHoursInput {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}
