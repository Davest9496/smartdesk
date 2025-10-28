import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

/**
 * Get Stripe instance with lazy initialization
 *
 * Why lazy initialization:
 * - Prevents build failures when STRIPE_SECRET_KEY is missing during CI/CD
 * - Only validates keys when actually used (at runtime, not build time)
 * - Allows Next.js build to succeed without payment credentials
 * - Still secure - throws error when payment routes are called without keys
 *
 * @throws Error if STRIPE_SECRET_KEY is missing at runtime
 * @returns Stripe client instance
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
        'Payment features cannot be used without this configuration.'
    )
  }

  // Reuse existing instance (singleton pattern)
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
      appInfo: {
        name: 'SmartDesk Booking System',
        version: '1.0.0',
      },
    })
  }

  return stripeInstance
}

/**
 * Backwards-compatible export using Proxy
 * Allows existing code using `stripe.method()` to work
 * But only initializes when actually used
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

/**
 * Convert pounds to pence (Stripe expects smallest currency unit)
 *
 * Why multiply by 100:
 * - Stripe API requires amounts in smallest currency unit
 * - For GBP: £1.50 = 150 pence
 * - For USD: $1.50 = 150 cents
 * - Math.round prevents floating-point precision issues
 *
 * @param pounds - Amount in pounds (e.g., 25.99)
 * @returns Amount in pence (e.g., 2599)
 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100)
}

/**
 * Convert pence to pounds
 *
 * @param pence - Amount in pence (e.g., 2599)
 * @returns Amount in pounds (e.g., 25.99)
 */
export function penceToPounds(pence: number): number {
  return pence / 100
}
