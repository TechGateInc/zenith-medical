import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth/config'
import { prisma } from '../../../../../lib/prisma'
import { auditLog, cleanupOldAuditLogs } from '../../../../../lib/audit/audit-logger'
import { AdminRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job or admin request
    const isVercelCron = request.headers.get('x-vercel-cron-token')
    
    let userId: string | undefined
    let userEmail: string | undefined

    // Check if it's a Vercel cron job
    if (isVercelCron) {
      // Verify cron token (optional additional security)
      const expectedCronToken = process.env.VERCEL_CRON_SECRET
      if (expectedCronToken && isVercelCron !== expectedCronToken) {
        return NextResponse.json({ error: 'Invalid cron token' }, { status: 401 })
      }
    } else {
      // Otherwise, require admin authentication
      const session = await getServerSession(authOptions)
      if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get user details and verify admin permissions
      const user = await prisma.adminUser.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true, role: true }
      })

      if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN].includes(user.role as AdminRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      userId = user.id
      userEmail = user.email
    }

    // Get retention period from environment (default 7 years for HIPAA compliance)
    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555')
    
    // Count logs before cleanup
    const totalLogsBefore = await prisma.auditLog.count()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    const logsToDelete = await prisma.auditLog.count({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    })

    // Perform cleanup using the utility function
    await cleanupOldAuditLogs(retentionDays)

    // Count logs after cleanup
    const totalLogsAfter = await prisma.auditLog.count()
    const deletedCount = totalLogsBefore - totalLogsAfter

    // Log the cleanup operation
    await auditLog({
      action: 'AUDIT_LOG_CLEANUP_COMPLETED',
      userId: userId,
      userEmail: userEmail || 'system',
      details: {
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
        totalLogsBefore,
        totalLogsAfter,
        deletedCount,
        automated: !!isVercelCron
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'system',
      userAgent: request.headers.get('user-agent') || 'vercel-cron'
    })

    return NextResponse.json({
      message: 'Audit log cleanup completed successfully',
      details: {
        retentionDays,
        deletedCount,
        remainingLogs: totalLogsAfter,
        cutoffDate: cutoffDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Audit log cleanup error:', error)
    
    // Log the failed cleanup attempt
    try {
      await auditLog({
        action: 'AUDIT_LOG_CLEANUP_FAILED',
        userId: userId,
        userEmail: userEmail || 'system',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          automated: !!request.headers.get('x-vercel-cron-token')
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'system',
        userAgent: request.headers.get('user-agent') || 'vercel-cron'
      })
    } catch (logError) {
      console.error('Failed to log cleanup error:', logError)
    }

    return NextResponse.json(
      { error: 'Audit log cleanup failed' },
      { status: 500 }
    )
  }
}

// Get cleanup status and statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN].includes(user.role as AdminRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get audit log statistics
    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555')
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const [totalLogs, oldLogs, recentCleanup] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      }),
      prisma.auditLog.findFirst({
        where: {
          action: 'AUDIT_LOG_CLEANUP_COMPLETED'
        },
        orderBy: {
          timestamp: 'desc'
        }
      })
    ])

    // Get age distribution
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    const [lastWeek, lastMonth, lastYear] = await Promise.all([
      prisma.auditLog.count({
        where: {
          timestamp: {
            gte: oneWeekAgo
          }
        }
      }),
      prisma.auditLog.count({
        where: {
          timestamp: {
            gte: oneMonthAgo
          }
        }
      }),
      prisma.auditLog.count({
        where: {
          timestamp: {
            gte: oneYearAgo
          }
        }
      })
    ])

    return NextResponse.json({
      statistics: {
        totalLogs,
        oldLogs,
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
        distribution: {
          lastWeek,
          lastMonth,
          lastYear
        }
      },
      lastCleanup: recentCleanup ? {
        timestamp: recentCleanup.timestamp,
        details: recentCleanup.details
      } : null
    })

  } catch (error) {
    console.error('Audit log statistics error:', error)
    return NextResponse.json(
      { error: 'Failed to get audit log statistics' },
      { status: 500 }
    )
  }
} 