import { z } from 'zod'

/**
 * Company signup validation schema
 */
export const signupSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  companyEmail: z.string().email('Invalid company email address').toLowerCase(),
  adminName: z
    .string()
    .min(2, 'Admin name must be at least 2 characters')
    .max(100, 'Admin name must be less than 100 characters'),
  adminEmail: z.string().email('Invalid admin email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type SignupInput = z.infer<typeof signupSchema>

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
