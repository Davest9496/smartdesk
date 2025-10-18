import { z } from 'zod'

/**
 * Service creation schema
 */
export const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name must be less than 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')), // Allow empty string
  duration: z
    .number()
    .int()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price cannot exceed £100,000'),
  isPublic: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
})

// Infer types AFTER defaults are applied
export type CreateServiceInput = z.input<typeof createServiceSchema>
export type CreateServiceOutput = z.output<typeof createServiceSchema>

/**
 * Service update schema
 */
export const updateServiceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  duration: z.number().int().min(15).max(480).optional(),
  price: z.number().min(0).max(100000).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>

/**
 * Service-Provider assignment schema
 */
export const assignProvidersSchema = z.object({
  providerIds: z
    .array(z.string())
    .min(1, 'At least one provider must be assigned'),
})
