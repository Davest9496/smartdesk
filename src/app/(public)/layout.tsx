import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Book your appointment online',
}

/**
 * Public layout for booking pages
 *
 * Why separate layout:
 * - No authentication required
 * - Different header/footer from dashboard
 * - Can add public-specific branding
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
