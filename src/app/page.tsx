import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">SmartDesk</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <div className="max-w-3xl space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-sm text-white">
              Multi-Tenant Booking System
            </div>

            {/* Heading */}
            <h2 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Professional Booking Management for Your Business
            </h2>

            {/* Description */}
            <p className="text-xl text-slate-600">
              Streamline your appointment scheduling with our powerful,
              multi-tenant booking platform. Built for service providers who
              need reliable, scalable booking management.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Sign in to Dashboard
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Smart Scheduling
                </h3>
                <p className="text-sm text-slate-600">
                  Automated availability calculation based on provider working
                  hours and existing bookings
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Secure Payments
                </h3>
                <p className="text-sm text-slate-600">
                  Integrated Stripe payments with support for multiple
                  currencies and payment methods
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Multi-Tenant Security
                </h3>
                <p className="text-sm text-slate-600">
                  Enterprise-grade data isolation ensuring complete privacy
                  between companies
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
