import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

/**
 * Auth configuration for NextAuth v5
 * This config is shared between middleware (Edge) and API routes (Node.js)
 *
 * IMPORTANT: bcrypt is lazy-loaded inside authorize() to prevent
 * Edge runtime from trying to bundle it
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This function ONLY runs in API routes (Node.js runtime), never in middleware
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findFirst({
          where: {
            email,
            isActive: true,
          },
          include: { company: true },
        })

        if (!user) {
          return null
        }

        if (!user.company.isActive) {
          throw new Error('Company account is suspended')
        }

        // Lazy load bcrypt - only imported when this function runs (API routes only)
        const bcrypt = await import('bcrypt')
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
        token.companyId = user.companyId as string
      }
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
