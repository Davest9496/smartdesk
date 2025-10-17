import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - SmartDesk',
  description: 'Sign in or create your SmartDesk account',
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
