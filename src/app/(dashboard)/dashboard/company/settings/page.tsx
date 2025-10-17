import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import CompanySettingsForm from '@/components/dashboard/CompanySettingsForm'
import CompanyProfileForm from '@/components/dashboard/CompanyProfileForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Company Settings | SmartDesk',
  description: 'Manage your company settings and preferences',
}

export default async function CompanySettingsPage() {
  const session = await auth()

  // Only admins can access this page
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-slate-600 mt-2">
          Manage your company profile and booking preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Company Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>
              Update your company information and branding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyProfileForm />
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Configuration</CardTitle>
            <CardDescription>
              Configure how bookings work for your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanySettingsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
