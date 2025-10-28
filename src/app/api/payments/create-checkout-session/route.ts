import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStripe, poundsToPence } from '@/lib/stripe'
import { getTenantContext } from '@/lib/tenant-context'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { z } from 'zod'

const createCheckoutSessionSchema = z.object({
  bookingId: z.string().cuid(),
})

/**
 * POST /api/payments/create-checkout-session
 * Create a Stripe Checkout Session and redirect user to Stripe-hosted payment page
 *
 * Why Checkout Session over Payment Intents:
 * - ✅ Stripe hosts the entire payment page (faster MVP implementation)
 * - ✅ PCI compliance handled automatically (no card data touches our servers)
 * - ✅ Built-in mobile-optimised UI
 * - ✅ Supports all payment methods out of the box (cards, wallets, BNPL)
 * - ✅ Automatic retry logic for failed payments
 * - ✅ Built-in fraud prevention (Stripe Radar)
 *
 * Flow:
 * 1. Client creates booking (status: PENDING)
 * 2. Client calls this API to get Checkout Session URL
 * 3. Client redirects to Stripe-hosted payment page
 * 4. After payment, Stripe redirects back to success_url
 * 5. Webhook confirms payment and updates booking to CONFIRMED
 */
export async function POST(request: NextRequest) {
  try {
    const { companyId } = await getTenantContext()

    const body = await request.json()
    const { bookingId } = createCheckoutSessionSchema.parse(body)

    // Fetch booking and verify tenant ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        client: true,
        provider: true,
        company: {
          include: {
            settings: true,
          },
        },
      },
    })

    if (!booking) {
      return notFoundResponse('Booking')
    }

    if (booking.companyId !== companyId) {
      return errorResponse('Forbidden: Cross-tenant access denied', 403)
    }

    // Verify booking is in PENDING status
    if (booking.status !== 'PENDING') {
      return errorResponse(
        `Cannot create payment for booking with status: ${booking.status}`,
        400
      )
    }

    // Get Stripe instance (lazy initialization - only now)
    const stripe = getStripe()

    // Get company currency (defaults to GBP)
    const currency = booking.company.settings?.currency || 'GBP'

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Add more if needed: ['card', 'klarna', 'afterpay_clearpay']
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: booking.service.name,
              description: `Booking with ${booking.provider.name} on ${new Date(
                booking.startTime
              ).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`,
            },
            unit_amount: poundsToPence(Number(booking.amount)),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/confirmation?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${booking.serviceId}/checkout?booking_id=${bookingId}&cancelled=true`,
      customer_email: booking.client.email,
      metadata: {
        bookingId: booking.id,
        companyId: booking.companyId,
        serviceId: booking.serviceId,
        providerId: booking.providerId,
        clientId: booking.clientId,
      },
      // Expire checkout session after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    })

    // Store checkout session ID in booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentId: session.id, // Store session ID instead of payment intent ID
        paymentStatus: 'PROCESSING',
      },
    })

    return successResponse({
      sessionId: session.id,
      sessionUrl: session.url, // ✅ This is the redirect URL
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        400
      )
    }

    if (error instanceof Error) {
      if (error.message.includes('Unauthorised')) {
        return errorResponse('Unauthorised', 401)
      }
      if (error.message.includes('Forbidden')) {
        return errorResponse('Forbidden', 403)
      }
      if (error.message.includes('STRIPE_SECRET_KEY')) {
        // Payment service not configured
        console.error('❌ Stripe not configured:', error.message)
        return errorResponse('Payment service unavailable', 503)
      }
    }

    return errorResponse('Failed to create checkout session', 500)
  }
}
