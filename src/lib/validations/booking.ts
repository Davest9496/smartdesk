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
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  clientEmail: z.string().email('Invalid email address').toLowerCase().trim(),

  // Phone validation - more lenient for international formats
  clientPhone: z
    .string()
    .min(1)
    .optional()
    .or(z.literal('')) // Allow empty string
    .transform((val) => (val === '' ? null : val)) // Convert empty to null
    .nullable(),

  // Optional notes
  clientNotes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val))
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

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
