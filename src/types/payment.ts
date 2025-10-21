import type { Stripe } from 'stripe'

export type StripePaymentIntent = Stripe.PaymentIntent
export type StripePaymentMethod = Stripe.PaymentMethod

/**
 * Payment intent creation request
 */
export interface CreatePaymentIntentRequest {
  bookingId: string
  amount: number // In pounds (will be converted to pence)
  currency?: string // Defaults to GBP
}

/**
 * Payment intent response
 */
export interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

/**
 * Webhook event types we handle
 */
export enum StripeWebhookEvent {
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED = 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELLED = 'payment_intent.canceled',
}

/**
 * Payment status for internal tracking
 */
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
