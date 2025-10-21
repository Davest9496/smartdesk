import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type { Stripe } from 'stripe'

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for Checkout Session flow
 *
 * SECURITY: Verifies webhook signature to prevent spoofing
 * RELIABILITY: Returns 500 on errors so Stripe retries
 * IDEMPOTENCY: Handles duplicate webhooks gracefully
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('❌ Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ Missing STRIPE_WEBHOOK_SECRET environment variable')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature (critical security step)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`✅ Webhook received: ${event.type} [ID: ${event.id}]`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'checkout.session.expired':
        await handleCheckoutExpired(
          event.data.object as Stripe.Checkout.Session
        )
        break

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    // Return 500 so Stripe retries the webhook
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful Checkout Session completion
 * This confirms the booking after payment succeeds
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId

  if (!bookingId) {
    console.error('❌ Missing bookingId in checkout session metadata', {
      sessionId: session.id,
    })
    return
  }

  console.log(`💰 Processing payment for booking: ${bookingId}`)

  // Verify payment was actually successful
  if (session.payment_status !== 'paid') {
    console.error(
      `❌ Checkout completed but payment_status is: ${session.payment_status}`,
      {
        bookingId,
        sessionId: session.id,
        paymentStatus: session.payment_status,
      }
    )
    return
  }

  // Check if booking was already confirmed (idempotency)
  const existingBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { status: true, paymentStatus: true },
  })

  if (existingBooking?.status === 'CONFIRMED') {
    console.log(
      `ℹ️  Booking ${bookingId} already confirmed (duplicate webhook)`
    )
    return
  }

  // Update booking to CONFIRMED
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      paymentStatus: 'SUCCEEDED',
      paymentId: session.payment_intent as string, // Store payment intent ID for refunds
      updatedAt: new Date(),
    },
  })

  console.log(`✅ Booking ${bookingId} confirmed successfully`, {
    sessionId: session.id,
    paymentIntentId: session.payment_intent,
  })

  // TODO Phase 2: Send confirmation email to client
  // TODO Phase 2: Send notification to provider
  // TODO Phase 2: Create calendar event
}

/**
 * Handle expired Checkout Session
 * This happens when user doesn't complete payment within 30 minutes
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId

  if (!bookingId) {
    console.error('❌ Missing bookingId in expired session metadata', {
      sessionId: session.id,
    })
    return
  }

  console.log(`⏰ Checkout session expired for booking: ${bookingId}`)

  // Reset booking payment status (allow client to retry)
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentId: null,
      paymentStatus: 'PENDING',
      updatedAt: new Date(),
    },
  })

  console.log(`🔄 Booking ${bookingId} reset to PENDING (session expired)`)

  // TODO Phase 2: Send reminder email to client
}
