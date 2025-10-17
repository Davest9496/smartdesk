import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe auth config for middleware
 * NO Prisma, NO bcrypt, NO heavy dependencies
 * Only contains configuration needed for session validation
 */
export const authConfigEdge: NextAuthConfig = {
  providers: [], // No providers needed in middleware
  callbacks: {
    async jwt({ token }) {
      // Just pass token through - validation happens in API routes
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'ADMIN' | 'PROVIDER'
        session.user.companyId = token.companyId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
}
