import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma'
import { AdminRole } from '../../generated/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          // Find admin user by email
          const adminUser = await prisma.adminUser.findUnique({
            where: { email: credentials.email.toLowerCase() }
          })

          if (!adminUser) {
            throw new Error('Invalid credentials')
          }

          // Check if account is locked
          if (adminUser.lockedUntil && adminUser.lockedUntil > new Date()) {
            throw new Error('Account is temporarily locked due to multiple failed login attempts')
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, adminUser.passwordHash)

          if (!isPasswordValid) {
            // Increment login attempts
            await prisma.adminUser.update({
              where: { id: adminUser.id },
              data: {
                loginAttempts: adminUser.loginAttempts + 1,
                // Lock account after 5 failed attempts for 15 minutes
                lockedUntil: adminUser.loginAttempts >= 4 
                  ? new Date(Date.now() + 15 * 60 * 1000) 
                  : undefined
              }
            })
            
            throw new Error('Invalid credentials')
          }

          // Reset login attempts on successful login
          await prisma.adminUser.update({
            where: { id: adminUser.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date()
            }
          })

          // Log successful login
          await prisma.auditLog.create({
            data: {
              userId: adminUser.id,
              action: 'LOGIN',
              resource: 'admin_user',
              resourceId: adminUser.id,
              details: { success: true },
              ipAddress: '', // Will be filled by middleware
              userAgent: '', // Will be filled by middleware
            }
          })

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as AdminRole
      }
      return session
    }
  },
  
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  events: {
    async signOut({ token }) {
      if (token?.id) {
        // Log successful logout
        await prisma.auditLog.create({
          data: {
            userId: token.id as string,
            action: 'LOGOUT',
            resource: 'admin_user',
            resourceId: token.id as string,
            details: { success: true }
          }
        })
      }
    }
  }
}

// Helper function to check admin permissions
export function hasPermission(userRole: AdminRole, requiredRole: AdminRole): boolean {
  const roleHierarchy = {
    [AdminRole.EDITOR]: 1,
    [AdminRole.ADMIN]: 2,
    [AdminRole.SUPER_ADMIN]: 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Helper function to create admin user (for initial setup)
export async function createAdminUser(email: string, password: string, name: string, role: AdminRole = AdminRole.ADMIN) {
  const hashedPassword = await bcrypt.hash(password, 12)
  
  return await prisma.adminUser.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      name,
      role
    }
  })
} 