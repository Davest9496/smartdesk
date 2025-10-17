import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { authConfigEdge } from '@/lib/auth.config.edge'

/**
 * Edge-optimized middleware
 * Uses minimal config without Prisma/bcrypt
 */
const { auth: edgeAuth } = NextAuth(authConfigEdge)

export default edgeAuth(async function middleware(req) {
  const session = req.auth
  const path = req.nextUrl.pathname

  // Public routes
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/api/auth',
  ]

  const isPublicPath =
    publicPaths.some((publicPath) => path.startsWith(publicPath)) ||
    path.startsWith('/book')

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Protected API routes
  if (path.startsWith('/api/') && !session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Protected dashboard routes
  if (path.startsWith('/dashboard') && !session) {
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
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}) as (req: NextRequest) => Promise<Response>

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
