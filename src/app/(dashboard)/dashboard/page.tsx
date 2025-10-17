import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Dashboard | SmartDesk',
  description: 'Manage your bookings and services',
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-slate-600 mt-2">
          Here&apos;s what&apos;s happening with your bookings today
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium text-slate-600">
            Today&apos;s Bookings
          </h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
          <p className="text-xs text-slate-500 mt-1">No bookings scheduled</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium text-slate-600">This Week</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
          <p className="text-xs text-slate-500 mt-1">No upcoming bookings</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">£0.00</p>
          <p className="text-xs text-slate-500 mt-1">No revenue yet</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Actions
        </h2>
        <p className="text-slate-600">
          Get started by adding services and providers to your account.
        </p>
      </div>
    </div>
  )
}
