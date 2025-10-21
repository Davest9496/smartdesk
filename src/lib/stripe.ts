import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

/**
 * Stripe client instance
 * Uses latest stable API version
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover', // ✅ Updated to latest version
  typescript: true,
})

/**
 * Convert pounds to pence (Stripe expects smallest currency unit)
 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100)
}

/**
 * Convert pence to pounds
 */
export function penceToPounds(pence: number): number {
  return pence / 100
}
