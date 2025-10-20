import { z } from 'zod'

/**
 * Booking creation schema
 *
 * Why these validations:
 * - startTime must be ISO 8601 for timezone handling
 * - Email validation prevents typos
 * - Phone is optional but validated if provided
 * - Name must be at least 2 characters (prevents single letters)
 */
export const createBookingSchema = z.object({
  serviceId: z.string().cuid('Invalid service ID'),
  providerId: z.string().cuid('Invalid provider ID'),
  companyId: z.string().cuid('Invalid company ID'),
  startTime: z.string().datetime('Invalid start time format'),

  // Client details
  clientName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  clientEmail: z.string().email('Invalid email address').toLowerCase(),
  clientPhone: z
    .string()
    .regex(/^(\+\d{1,3}[- ]?)?\d{10,}$/, 'Invalid phone number format')
    .optional()
    .nullable(),

  // Optional notes
  clientNotes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .nullable(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

/**
 * Booking cancellation schema
 */
export const cancelBookingSchema = z.object({
  cancellationReason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
  cancelledBy: z.enum(['client', 'provider', 'admin']),
})
