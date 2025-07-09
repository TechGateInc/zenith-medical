import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth/config'
import { prisma } from '../../../../../lib/prisma'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import { ComplianceChecker } from '../../../../../lib/compliance/hipaa-pipeda-compliance'
import { AdminRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  // Declare variables outside try block for catch block access
  let userId: string | undefined
  let userEmail: string | undefined
  
  try {
    // Verify this is a cron job or admin request
    const isVercelCron = request.headers.get('x-vercel-cron-token')

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

      if (!user || !user.role || (user.role !== AdminRole.SUPER_ADMIN && user.role !== AdminRole.ADMIN)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      userId = user.id
      userEmail = user.email
    }

    // Initialize compliance checker
    const complianceChecker = new ComplianceChecker()

    // Perform comprehensive compliance check
    const complianceReport = await complianceChecker.performComplianceCheck()

    // Count critical issues
    const criticalIssues = complianceReport.critical_issues.length
    const isCompliant = complianceReport.overall_score >= 90 && criticalIssues === 0

    // Log the compliance check
    await auditLog({
      action: 'COMPLIANCE_CHECK_COMPLETED',
      userId: userId,
      userEmail: userEmail || 'system',
      details: {
        overallScore: complianceReport.overall_score,
        hipaaScore: complianceReport.hipaa_score,
        pipedaScore: complianceReport.pipeda_score,
        totalRulesChecked: complianceReport.total_rules_checked,
        compliantRules: complianceReport.compliant_rules,
        criticalIssues,
        isCompliant,
        automated: !!isVercelCron,
        nextReviewDate: complianceReport.next_review_date
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'system',
      userAgent: request.headers.get('user-agent') || 'vercel-cron'
    })

    // If there are critical issues, send alert notification
    if (criticalIssues > 0) {
      await sendComplianceAlert(complianceReport, userEmail || 'system')
    }

    return NextResponse.json({
      message: 'Compliance check completed successfully',
      report: complianceReport,
      summary: {
        isCompliant,
        overallScore: complianceReport.overall_score,
        criticalIssues,
        nextReviewDate: complianceReport.next_review_date
      }
    })

  } catch (error) {
    console.error('Compliance check error:', error)
    
    // Log the failed compliance check
    try {
      await auditLog({
        action: 'COMPLIANCE_CHECK_FAILED',
        userId: userId || 'system',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          automated: !!request.headers.get('x-vercel-cron-token')
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'system',
        userAgent: request.headers.get('user-agent') || 'vercel-cron'
      })
    } catch (logError) {
      console.error('Failed to log compliance check error:', logError)
    }

    return NextResponse.json(
      { error: 'Compliance check failed' },
      { status: 500 }
    )
  }
}

// Get latest compliance status
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN' || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || (user.role !== AdminRole.SUPER_ADMIN && user.role !== AdminRole.ADMIN && user.role !== AdminRole.EDITOR)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get latest compliance check from audit logs
    const latestCheck = await prisma.auditLog.findFirst({
      where: {
        action: 'COMPLIANCE_CHECK_COMPLETED'
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Get compliance issues from recent checks
    const recentChecks = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['COMPLIANCE_CHECK_COMPLETED', 'COMPLIANCE_CHECK_FAILED']
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    })

    // Calculate trends
    const checkHistory = recentChecks.map(check => {
      const details = check.details as any
      return {
        timestamp: check.timestamp,
        success: check.action === 'COMPLIANCE_CHECK_COMPLETED',
        score: details?.overallScore || 0,
        criticalIssues: details?.criticalIssues || 0
      }
    })

    return NextResponse.json({
      latestCheck: latestCheck ? {
        timestamp: latestCheck.timestamp,
        details: latestCheck.details
      } : null,
      history: checkHistory,
      summary: {
        lastCheckDate: latestCheck?.timestamp || null,
        isCompliant: (latestCheck?.details as any)?.isCompliant || false,
        overallScore: (latestCheck?.details as any)?.overallScore || 0,
        criticalIssues: (latestCheck?.details as any)?.criticalIssues || 0
      }
    })

  } catch (error) {
    console.error('Compliance status error:', error)
    return NextResponse.json(
      { error: 'Failed to get compliance status' },
      { status: 500 }
    )
  }
}

async function sendComplianceAlert(report: any, initiatedBy: string) {
  try {
    // This would integrate with the notification service to send alerts
    // For now, we'll just log the alert
    await auditLog({
      action: 'COMPLIANCE_ALERT_SENT',
      userId: undefined,
      userEmail: 'system',
      details: {
        overallScore: report.overall_score,
        criticalIssues: report.critical_issues.length,
        issues: report.critical_issues.map((issue: any) => ({
          severity: issue.severity,
          description: issue.description,
          regulation: issue.regulation
        })),
        initiatedBy
      },
      ipAddress: 'system',
      userAgent: 'compliance-monitor'
    })

    console.warn('Compliance Alert: Critical issues detected', {
      score: report.overall_score,
      criticalIssues: report.critical_issues.length
    })

  } catch (error) {
    console.error('Failed to send compliance alert:', error)
  }
} 