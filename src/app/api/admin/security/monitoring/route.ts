import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth/config'
import { prisma } from '../../../../../lib/prisma'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import { AdminRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details and verify admin permissions
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || (user.role !== AdminRole.SUPER_ADMIN && user.role !== AdminRole.ADMIN)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '24h' // 1h, 24h, 7d, 30d
    const limit = parseInt(searchParams.get('limit') || '100')

    // Calculate time range
    const now = new Date()
    let startTime: Date
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default: // 24h
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Get security events from audit logs
    const securityEvents = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startTime
        },
        action: {
          in: [
            'LOGIN_FAILED',
            'ACCOUNT_LOCKED',
            'SUSPICIOUS_ACTIVITY',
            'RATE_LIMIT_EXCEEDED',
            'UNAUTHORIZED_ACCESS',
            'SECURITY_VIOLATION',
            'PASSWORD_RESET_FAILED',
            'MULTIPLE_LOGIN_ATTEMPTS'
          ]
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    })

    // Get authentication metrics
    const authMetrics = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        timestamp: {
          gte: startTime
        },
        action: {
          in: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT']
        }
      },
      _count: {
        action: true
      }
    })

    // Get failed login attempts by IP
    const failedLoginsByIP = await prisma.auditLog.groupBy({
      by: ['ipAddress'],
      where: {
        timestamp: {
          gte: startTime
        },
        action: 'LOGIN_FAILED'
      },
      _count: {
        ipAddress: true
      },
      orderBy: {
        _count: {
          ipAddress: 'desc'
        }
      },
      take: 10
    })

    // Get user activity metrics
    const userActivity = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: startTime
        }
      },
      _count: {
        userId: true
      },
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 10
    })

    // Get resource access patterns
    const resourceAccess = await prisma.auditLog.groupBy({
      by: ['resource'],
      where: {
        timestamp: {
          gte: startTime
        }
      },
      _count: {
        resource: true
      },
      orderBy: {
        _count: {
          resource: 'desc'
        }
      },
      take: 15
    })

    // Calculate security score (0-100)
    const totalEvents = securityEvents.length
    const failedLogins = authMetrics.find((m: any) => m.action === 'LOGIN_FAILED')?._count.action || 0
    const successfulLogins = authMetrics.find((m: any) => m.action === 'LOGIN_SUCCESS')?._count.action || 0
    
    let securityScore = 100
    
    // Deduct points for security issues
    if (failedLogins > 0) {
      const failureRate = failedLogins / Math.max(successfulLogins + failedLogins, 1)
      securityScore -= Math.min(failureRate * 50, 30) // Max 30 point deduction
    }
    
    if (totalEvents > 10) {
      securityScore -= Math.min((totalEvents - 10) * 2, 40) // Max 40 point deduction
    }
    
    securityScore = Math.max(securityScore, 0)

    // Generate alerts
    const alerts = []
    
    if (failedLogins > 10) {
      alerts.push({
        type: 'warning',
        message: `High number of failed login attempts (${failedLogins}) in the last ${timeRange}`,
        severity: 'medium'
      })
    }
    
    if (failedLogins > 50) {
      alerts.push({
        type: 'error',
        message: `Critical: Very high number of failed login attempts (${failedLogins}). Possible brute force attack.`,
        severity: 'high'
      })
    }
    
    const topFailedIP = failedLoginsByIP[0]
    if (topFailedIP && topFailedIP._count.ipAddress > 5) {
      alerts.push({
        type: 'warning',
        message: `IP ${topFailedIP.ipAddress} has ${topFailedIP._count.ipAddress} failed login attempts`,
        severity: 'medium'
      })
    }

    if (securityScore < 70) {
      alerts.push({
        type: 'error',
        message: `Security score is low (${Math.round(securityScore)}%). Review security events.`,
        severity: 'high'
      })
    }

    // Audit the monitoring access
    await auditLog({
      action: 'SECURITY_MONITORING_ACCESSED',
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      resource: 'security_monitoring',
      details: {
        timeRange,
        eventsReviewed: totalEvents,
        securityScore: Math.round(securityScore)
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      timeRange,
      securityScore: Math.round(securityScore),
      alerts,
      metrics: {
        totalSecurityEvents: totalEvents,
        authenticationMetrics: authMetrics.reduce((acc: Record<string, number>, metric: { action: string; _count: { action: number } }) => {
          acc[metric.action.toLowerCase()] = metric._count.action
          return acc
        }, {} as Record<string, number>),
        topFailedLoginIPs: failedLoginsByIP.map((item: { ipAddress: string | null; _count: { ipAddress: number } }) => ({
          ip: item.ipAddress || 'unknown',
          attempts: item._count.ipAddress
        })),
        activeUsers: userActivity.length,
        topResourceAccess: resourceAccess.map((item: { resource: string; _count: { resource: number } }) => ({
          resource: item.resource,
          accessCount: item._count.resource
        }))
      },
      events: securityEvents.map((event: { id: string; timestamp: Date; action: string; ipAddress: string | null; userAgent: string | null; details: unknown; userId: string | null }) => ({
        id: event.id,
        timestamp: event.timestamp,
        action: event.action,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details,
        userId: event.userId
      })),
      summary: {
        period: timeRange,
        generatedAt: now.toISOString(),
        eventsAnalyzed: totalEvents,
        alertsGenerated: alerts.length
      }
    })

  } catch (error) {
    console.error('Security monitoring error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve security monitoring data'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow super admin to acknowledge security alerts
    if (!session?.user?.role || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { action, target, notes } = body

    let result = {}

    switch (action) {
      case 'acknowledge_alert':
        // Log alert acknowledgment
        await auditLog({
          action: 'SECURITY_ALERT_ACKNOWLEDGED',
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          resource: 'security_alert',
          details: {
            alertTarget: target,
            notes: notes || 'No notes provided'
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        })
        result = { message: 'Alert acknowledged' }
        break

      case 'block_ip':
        // This would integrate with your firewall/security service
        // For now, just log the action
        await auditLog({
          action: 'IP_BLOCKED',
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          resource: 'security_action',
          details: {
            blockedIP: target,
            reason: notes || 'Manual block via security monitoring'
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        })
        result = { message: `IP ${target} blocked` }
        break

      case 'reset_security_events':
        // This could clear certain types of events or reset counters
        await auditLog({
          action: 'SECURITY_EVENTS_RESET',
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          resource: 'security_action',
          details: {
            resetType: target,
            notes: notes || 'Manual reset via security monitoring'
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        })
        result = { message: 'Security events reset' }
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Security action error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to perform security action'
    }, { status: 500 })
  }
}

// Real-time security status endpoint
export async function HEAD() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'SUPER_ADMIN') {
      return new NextResponse(null, { status: 403 })
    }

    // Quick security status check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const recentSecurityEvents = await prisma.auditLog.count({
      where: {
        timestamp: {
          gte: oneHourAgo
        },
        action: {
          in: ['LOGIN_FAILED', 'RATE_LIMIT_EXCEEDED', 'SECURITY_VIOLATION']
        }
      }
    })

    const response = new NextResponse(null, { status: 200 })
    response.headers.set('X-Security-Events', recentSecurityEvents.toString())
    response.headers.set('X-Security-Status', recentSecurityEvents > 10 ? 'alert' : 'normal')
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    return response

  } catch {
    return new NextResponse(null, { status: 500 })
  }
} 