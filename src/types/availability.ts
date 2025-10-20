export interface TimeSlot {
  startTime: Date
  endTime: Date
  available: boolean
}

export interface AvailabilityResponse {
  date: string
  providerId: string
  serviceId: string
  availableSlots: {
    startTime: string // ISO 8601 format
    endTime: string // ISO 8601 format
  }[]
  totalSlots: number
}

export interface AvailabilityQuery {
  providerId: string
  serviceId: string
  date: string // YYYY-MM-DD format
  companyId: string
}

export interface DayAvailability {
  date: string
  dayOfWeek: number
  hasAvailability: boolean
  slotCount: number
}
