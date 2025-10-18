import { z } from 'zod'

/**
 * Provider creation schema
 */
export const createProviderSchema = z.object({
  name: z
    .string()
    .min(2, 'Provider name must be at least 2 characters')
    .max(100, 'Provider name must be less than 100 characters'),
  email: z.string().email('Invalid email address').toLowerCase(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
})

export type CreateProviderInput = z.infer<typeof createProviderSchema>

/**
 * Provider update schema
 */
export const updateProviderSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().toLowerCase().optional(),
  bio: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
})

/**
 * Working hours schema
 */
export const workingHoursSchema = z.object({
  dayOfWeek: z
    .number()
    .int()
    .min(0, 'Day must be between 0 (Sunday) and 6 (Saturday)')
    .max(6, 'Day must be between 0 (Sunday) and 6 (Saturday)'),
  startTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
})

/**
 * Batch working hours update
 */
export const updateWorkingHoursSchema = z.object({
  workingHours: z.array(workingHoursSchema),
})

/**
 * Validate time logic (endTime > startTime)
 */
export function validateTimeRange(startTime: string, endTime: string): boolean {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  return endMinutes > startMinutes
}
