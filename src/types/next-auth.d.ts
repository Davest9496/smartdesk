import 'next-auth'

declare module 'next-auth' {
  /**
   * Extended User type to include our custom fields
   */
  interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'PROVIDER'
    companyId: string
  }

  /**
   * Extended Session type to include user with custom fields
   */
  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT type to include our custom fields
   */
  interface JWT {
    id: string
    role: 'ADMIN' | 'PROVIDER'
    companyId: string
  }
}
