import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { comparePassword } from '@/lib/password'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Find user by email
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

        // Check if company is active
        if (!user.company.isActive) {
          throw new Error('Company account is suspended')
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Update last login timestamp
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
    /**
     * JWT callback - adds custom fields to the token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
        token.companyId = user.companyId as string
      }
      return token
    },
    /**
     * Session callback - makes custom fields available in the session
     */
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
