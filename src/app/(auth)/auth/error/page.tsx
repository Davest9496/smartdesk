'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const errorMessage = error
    ? (errorMessages[error] ?? errorMessages.Default)
    : errorMessages.Default

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Error</CardTitle>
        <CardDescription>
          We encountered a problem signing you in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => router.push('/auth/signin')}>
          Back to sign in
        </Button>
      </CardFooter>
    </Card>
  )
}
