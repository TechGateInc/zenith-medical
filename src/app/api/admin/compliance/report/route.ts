import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth/config'
import { complianceChecker } from '../../../../../lib/compliance/hipaa-pipeda-compliance'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import { prisma } from '../../../../../lib/prisma'
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
    const action = searchParams.get('action') || 'latest'
    const format = searchParams.get('format') || 'json'

    if (action === 'latest') {
      // Return the latest compliance report from cache or generate new one
      // In a real implementation, you'd check cache first
      // For now, we'll generate a new report each time
      const report = await complianceChecker.performComplianceCheck()
      
      // Log the compliance report access
      await auditLog({
        action: 'COMPLIANCE_REPORT_ACCESSED',
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        resource: 'compliance_report',
        details: {
          overall_score: report.overall_score,
          hipaa_score: report.hipaa_score,
          pipeda_score: report.pipeda_score,
          critical_issues: report.critical_issues.length
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })

      if (format === 'pdf') {
        // Generate PDF report (would use a PDF library like Puppeteer or jsPDF)
        return NextResponse.json({
          success: false,
          error: 'PDF generation not implemented yet'
        }, { status: 501 })
      }

      return NextResponse.json({
        success: true,
        report
      })
    }

    if (action === 'rules') {
      // Return all compliance rules
      const rules = complianceChecker.getComplianceRules()
      
      return NextResponse.json({
        success: true,
        rules: rules.map(rule => ({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          regulation: rule.regulation,
          category: rule.category,
          severity: rule.severity,
          automated: rule.automated
        }))
      })
    }

    if (action === 'schedule') {
      // Get next scheduled compliance check
      // In a real implementation, this would check a scheduled jobs system
      const nextCheck = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      
      return NextResponse.json({
        success: true,
        next_scheduled_check: nextCheck.toISOString(),
        frequency: 'monthly',
        automated: true
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action parameter'
    }, { status: 400 })

  } catch (error) {
    console.error('Compliance report error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate compliance report'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { action } = body

    if (action === 'run_check') {
      // Trigger a new compliance check
      const report = await complianceChecker.performComplianceCheck()
      
      // Log the manual compliance check
      await auditLog({
        action: 'COMPLIANCE_CHECK_TRIGGERED',
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        resource: 'compliance_check',
        details: {
          triggered_manually: true,
          overall_score: report.overall_score,
          hipaa_score: report.hipaa_score,
          pipeda_score: report.pipeda_score,
          total_issues: Object.values(report.issues_by_severity).reduce((a, b) => a + b, 0),
          critical_issues: report.critical_issues.length
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })

      return NextResponse.json({
        success: true,
        message: 'Compliance check completed',
        report
      })
    }

    if (action === 'export_report') {
      // Export compliance report in various formats
      const format = body.format || 'json'
      const report = await complianceChecker.performComplianceCheck()

      if (format === 'csv') {
        // Generate CSV export
        const csvData = generateCSVReport(report)
        
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }

      if (format === 'xml') {
        // Generate XML export
        const xmlData = generateXMLReport(report)
        
        return new NextResponse(xmlData, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.xml"`
          }
        })
      }

      return NextResponse.json({
        success: true,
        report
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Compliance action error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to perform compliance action'
    }, { status: 500 })
  }
}

// Helper function to generate CSV report
function generateCSVReport(report: any): string {
  const headers = ['Rule ID', 'Category', 'Regulation', 'Severity', 'Compliant', 'Score', 'Issues', 'Recommendations']
  const rows = [headers.join(',')]

  Object.entries(report.categories).forEach(([category, result]: [string, any]) => {
    const row = [
      category,
      category,
      'BOTH', // Most categories apply to both
      'VARIOUS',
      result.compliant ? 'Yes' : 'No',
      result.score.toString(),
      result.issues.length.toString(),
      result.recommendations.length.toString()
    ]
    rows.push(row.join(','))
  })

  // Add summary row
  rows.push('')
  rows.push('SUMMARY')
  rows.push(`Overall Score,${report.overall_score}`)
  rows.push(`HIPAA Score,${report.hipaa_score}`)
  rows.push(`PIPEDA Score,${report.pipeda_score}`)
  rows.push(`Total Rules Checked,${report.total_rules_checked}`)
  rows.push(`Compliant Rules,${report.compliant_rules}`)
  rows.push(`Critical Issues,${report.critical_issues.length}`)

  return rows.join('\n')
}

// Helper function to generate XML report
function generateXMLReport(report: any): string {
  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<ComplianceReport>\n'
  xml += `  <GeneratedAt>${report.generated_at}</GeneratedAt>\n`
  xml += `  <OverallScore>${report.overall_score}</OverallScore>\n`
  xml += `  <HIPAAScore>${report.hipaa_score}</HIPAAScore>\n`
  xml += `  <PIPEDAScore>${report.pipeda_score}</PIPEDAScore>\n`
  xml += `  <TotalRulesChecked>${report.total_rules_checked}</TotalRulesChecked>\n`
  xml += `  <CompliantRules>${report.compliant_rules}</CompliantRules>\n`
  
  xml += '  <Categories>\n'
  Object.entries(report.categories).forEach(([category, result]: [string, any]) => {
    xml += `    <Category name="${category}">\n`
    xml += `      <Compliant>${result.compliant}</Compliant>\n`
    xml += `      <Score>${result.score}</Score>\n`
    xml += `      <IssuesCount>${result.issues.length}</IssuesCount>\n`
    xml += `      <RecommendationsCount>${result.recommendations.length}</RecommendationsCount>\n`
    xml += '    </Category>\n'
  })
  xml += '  </Categories>\n'
  
  xml += '  <CriticalIssues>\n'
  report.critical_issues.forEach((issue: any) => {
    xml += '    <Issue>\n'
    xml += `      <Severity>${issue.severity}</Severity>\n`
    xml += `      <Description>${escapeXml(issue.description)}</Description>\n`
    xml += `      <Regulation>${issue.regulation}</Regulation>\n`
    xml += `      <Remediation>${escapeXml(issue.remediation)}</Remediation>\n`
    xml += '    </Issue>\n'
  })
  xml += '  </CriticalIssues>\n'
  
  xml += '</ComplianceReport>'
  
  return xml
}

// Compliance summary endpoint (for dashboard widgets)
export async function HEAD(request: NextRequest) {
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
      return new NextResponse(null, { status: 403 })
    }

    // Quick compliance status check (cached values would be ideal)
    // For now, we'll return static headers indicating general compliance status
    const response = new NextResponse(null, { status: 200 })
    
    // These would be calculated from the latest compliance report
    response.headers.set('X-Compliance-Score', '85') // Example score
    response.headers.set('X-HIPAA-Score', '87')
    response.headers.set('X-PIPEDA-Score', '83')
    response.headers.set('X-Critical-Issues', '2')
    response.headers.set('X-Last-Check', new Date().toISOString())
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    return response

  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
} 