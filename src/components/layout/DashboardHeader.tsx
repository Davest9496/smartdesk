'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  async function handleSignOut() {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">SmartDesk</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
