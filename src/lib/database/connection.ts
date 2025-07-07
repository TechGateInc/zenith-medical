import { PrismaClient } from '../../generated/prisma'

declare global {
  // Prevent multiple instances of Prisma Client in development
  var prisma: PrismaClient | undefined
}

const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export { prisma }

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
} 