import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Force Node.js runtime to support bcrypt and Prisma
export const runtime = 'nodejs'

export default auth((req) => {
  const token = req.auth
  const path = req.nextUrl.pathname

  // Allow public routes
  if (path.startsWith('/book') || path === '/') {
    return NextResponse.next()
  }

  // Allow auth routes
  if (path.startsWith('/auth')) {
    // Redirect to dashboard if already logged in
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Require authentication for dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(signInUrl)
    }

    // Admin-only routes
    if (
      path.startsWith('/dashboard/company') &&
      (token as { role?: string }).role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // API routes requiring authentication
  if (path.startsWith('/api/')) {
    // Exclude public API routes
    if (!path.startsWith('/api/auth') && !path.startsWith('/api/public')) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
