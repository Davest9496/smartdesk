import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

/**
 * NextAuth middleware instance for Edge runtime
 * This uses only the config, no bcrypt imports in the execution path
 */
const { auth: edgeAuth } = NextAuth(authConfig)

export default edgeAuth(async function middleware(req) {
  const session = req.auth
  const path = req.nextUrl.pathname

  // Public routes - no authentication required
  const publicRoutes = ['/auth/signin', '/auth/signup', '/auth/error']
  const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/book')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Dashboard and API routes require authentication
  const isProtectedRoute =
    path.startsWith('/dashboard') || path.startsWith('/api/')

  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(signInUrl)
  }

  // Admin-only routes
  const isAdminRoute =
    path.startsWith('/dashboard/company') ||
    path.startsWith('/dashboard/users') ||
    path.startsWith('/api/company/settings') ||
    path.startsWith('/api/company/profile')

  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}) as (req: NextRequest) => Promise<Response>

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
