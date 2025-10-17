import { Suspense } from 'react'
import SignInForm from '@/components/auth/SignInForm'

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        <p className="mt-2 text-sm text-slate-600">Loading...</p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInForm />
    </Suspense>
  )
}
