'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-red-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Authentication Error
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {error === 'Configuration' &&
              'There is a problem with the server configuration.'}
            {error === 'AccessDenied' &&
              'You do not have permission to sign in.'}
            {error === 'Verification' &&
              'The verification token has expired or has already been used.'}
            {error === 'OAuthSignin' &&
              'Error in constructing an authorisation URL.'}
            {error === 'OAuthCallback' &&
              'Error in handling the response from an OAuth provider.'}
            {error === 'OAuthCreateAccount' &&
              'Could not create OAuth provider user in the database.'}
            {error === 'EmailCreateAccount' &&
              'Could not create email provider user in the database.'}
            {error === 'Callback' &&
              'Error in the OAuth callback handler route.'}
            {error === 'OAuthAccountNotLinked' &&
              'Email is already associated with another account.'}
            {error === 'SessionRequired' &&
              'Please sign in to access this page.'}
            {error === 'Default' && 'An unexpected error occurred.'}
            {!error && 'An unexpected error occurred.'}
          </p>
        </div>
        <div className="mt-6">
          <a
            href="/auth/signin"
            className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
