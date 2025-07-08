import { AdminRole } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: AdminRole
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: AdminRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: AdminRole
    id: string
  }
} 