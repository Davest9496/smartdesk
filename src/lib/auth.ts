import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

/**
 * NextAuth instance
 * Imported by API routes and server components (Node.js runtime)
 */
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
