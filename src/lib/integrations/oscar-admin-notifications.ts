import { prisma } from '../prisma'
import { auditLog } from '../audit/audit-logger'
import { notificationService } from './notification-service'
import type { OscarErrorType, ErrorSeverity } from '@prisma/client'

export interface NotificationRule {
  id: string
  name: string
  errorTypes: OscarErrorType[]
  severities: ErrorSeverity[]
  threshold: number // Number of errors within timeWindow
  timeWindow: number // Minutes
  cooldown: number // Minutes before same rule can trigger again
  enabled: boolean
  emailRecipients: string[]
  dashboardAlert: boolean
  escalation?: {
    threshold: number
    timeWindow: number
    recipients: string[]
  }
}

export interface AlertContext {
  errors: any[]
  rule: NotificationRule
  triggeredAt: Date
  errorCount: number
  timeWindow: string
}

export interface DashboardAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  severity: ErrorSeverity
  errorType: OscarErrorType
  errorCount: number
  affectedOperations: string[]
  createdAt: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolvedAt?: Date
}

export interface NotificationStats {
  alertsSent24h: number
  criticalErrors24h: number
  unacknowledgedAlerts: number
  topErrorTypes: { type: OscarErrorType; count: number }[]
  affectedOperations: { operation: string; count: number }[]
}

export class OscarAdminNotifications {
  private static instance: OscarAdminNotifications
  private alertCheckInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL_MS = 60000 // Check every minute
  private lastRuleExecution: Map<string, Date> = new Map()

  // Default notification rules
  private readonly DEFAULT_RULES: Omit<NotificationRule, 'id'>[] = [
    {
      name: 'Critical Authentication Failures',
      errorTypes: ['AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR'],
      severities: ['CRITICAL', 'ERROR'],
      threshold: 3,
      timeWindow: 15, // 15 minutes
      cooldown: 60, // 1 hour
      enabled: true,
      emailRecipients: [], // Will be populated from env vars
      dashboardAlert: true,
      escalation: {
        threshold: 10,
        timeWindow: 30,
        recipients: [] // Will be populated for escalation
      }
    },
    {
      name: 'Network Connection Issues',
      errorTypes: ['NETWORK_ERROR', 'TIMEOUT_ERROR'],
      severities: ['ERROR', 'WARNING'],
      threshold: 5,
      timeWindow: 10,
      cooldown: 30,
      enabled: true,
      emailRecipients: [],
      dashboardAlert: true
    },
    {
      name: 'High Volume API Errors',
      errorTypes: ['SERVER_ERROR', 'CLIENT_ERROR', 'RATE_LIMIT_ERROR'],
      severities: ['ERROR', 'WARNING'],
      threshold: 10,
      timeWindow: 5,
      cooldown: 15,
      enabled: true,
      emailRecipients: [],
      dashboardAlert: true
    },
    {
      name: 'Configuration Problems',
      errorTypes: ['CONFIGURATION_ERROR'],
      severities: ['CRITICAL', 'ERROR'],
      threshold: 1,
      timeWindow: 60,
      cooldown: 240, // 4 hours
      enabled: true,
      emailRecipients: [],
      dashboardAlert: true
    },
    {
      name: 'Data Integrity Issues',
      errorTypes: ['DATA_ERROR', 'VALIDATION_ERROR'],
      severities: ['ERROR'],
      threshold: 5,
      timeWindow: 30,
      cooldown: 120, // 2 hours
      enabled: true,
      emailRecipients: [],
      dashboardAlert: true
    }
  ]

  constructor() {
    // Singleton pattern
    this.initializeDefaultRules()
  }

  public static getInstance(): OscarAdminNotifications {
    if (!OscarAdminNotifications.instance) {
      OscarAdminNotifications.instance = new OscarAdminNotifications()
    }
    return OscarAdminNotifications.instance
  }

  /**
   * Initialize default notification rules from environment variables
   */
  private async initializeDefaultRules(): Promise<void> {
    try {
      const adminEmails = this.getAdminEmails()
      const escalationEmails = this.getEscalationEmails()

      for (const rule of this.DEFAULT_RULES) {
        const fullRule: NotificationRule = {
          ...rule,
          id: this.generateRuleId(rule.name),
          emailRecipients: adminEmails,
          escalation: rule.escalation ? {
            ...rule.escalation,
            recipients: escalationEmails
          } : undefined
        }

        // Store rule if it doesn't exist
        await this.upsertRule(fullRule)
      }
    } catch (error) {
      console.error('Failed to initialize notification rules:', error)
    }
  }

  /**
   * Start the alert monitoring system
   */
  public startMonitoring(): void {
    if (this.alertCheckInterval) {
      return
    }

    this.alertCheckInterval = setInterval(async () => {
      try {
        await this.checkForAlerts()
      } catch (error) {
        console.error('Alert monitoring error:', error)
        await this.logOperation('ALERT_CHECK_ERROR', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }, this.CHECK_INTERVAL_MS)

    console.log('OSCAR admin notifications monitoring started')
  }

  /**
   * Stop the alert monitoring system
   */
  public stopMonitoring(): void {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval)
      this.alertCheckInterval = null
    }
    console.log('OSCAR admin notifications monitoring stopped')
  }

  /**
   * Check for alert conditions
   */
  private async checkForAlerts(): Promise<void> {
    const rules = await this.getActiveRules()

    for (const rule of rules) {
      try {
        await this.evaluateRule(rule)
      } catch (error) {
        console.error(`Error evaluating rule ${rule.name}:`, error)
      }
    }
  }

  /**
   * Evaluate a single notification rule
   */
  private async evaluateRule(rule: NotificationRule): Promise<void> {
    // Check cooldown
    const lastExecution = this.lastRuleExecution.get(rule.id)
    if (lastExecution && Date.now() - lastExecution.getTime() < rule.cooldown * 60 * 1000) {
      return
    }

    // Get errors matching the rule criteria
    const timeWindowStart = new Date(Date.now() - rule.timeWindow * 60 * 1000)
    
    const errors = await prisma.oscarErrorLog.findMany({
      where: {
        errorType: { in: rule.errorTypes },
        severity: { in: rule.severities },
        createdAt: { gte: timeWindowStart },
        resolved: false
      },
      orderBy: { createdAt: 'desc' }
    })

    // Check if threshold is exceeded
    if (errors.length >= rule.threshold) {
      await this.triggerAlert(rule, errors)
      this.lastRuleExecution.set(rule.id, new Date())

      // Check escalation if configured
      if (rule.escalation && errors.length >= rule.escalation.threshold) {
        const escalationTimeStart = new Date(Date.now() - rule.escalation.timeWindow * 60 * 1000)
        const escalationErrors = errors.filter(e => e.createdAt >= escalationTimeStart)
        
        if (escalationErrors.length >= rule.escalation.threshold) {
          await this.triggerEscalation(rule, escalationErrors)
        }
      }
    }
  }

  /**
   * Trigger an alert based on a rule
   */
  private async triggerAlert(rule: NotificationRule, errors: any[]): Promise<void> {
    const context: AlertContext = {
      errors,
      rule,
      triggeredAt: new Date(),
      errorCount: errors.length,
      timeWindow: `${rule.timeWindow} minutes`
    }

    // Send email notifications
    if (rule.emailRecipients.length > 0) {
      await this.sendEmailAlert(context)
    }

    // Create dashboard alert
    if (rule.dashboardAlert) {
      await this.createDashboardAlert(context)
    }

    await this.logOperation('ALERT_TRIGGERED', {
      ruleName: rule.name,
      errorCount: errors.length,
      timeWindow: rule.timeWindow,
      recipients: rule.emailRecipients.length
    })
  }

  /**
   * Trigger escalation alert
   */
  private async triggerEscalation(rule: NotificationRule, errors: any[]): Promise<void> {
    if (!rule.escalation) return

    const context: AlertContext = {
      errors,
      rule,
      triggeredAt: new Date(),
      errorCount: errors.length,
      timeWindow: `${rule.escalation.timeWindow} minutes`
    }

    // Send escalation emails
    if (rule.escalation.recipients.length > 0) {
      await this.sendEscalationAlert(context, rule.escalation.recipients)
    }

    await this.logOperation('ESCALATION_TRIGGERED', {
      ruleName: rule.name,
      errorCount: errors.length,
      escalationRecipients: rule.escalation.recipients.length
    })
  }

  /**
   * Send email alert to administrators
   */
  private async sendEmailAlert(context: AlertContext): Promise<void> {
    try {
      const { errors, rule, errorCount, timeWindow } = context

      // Group errors by type for summary
      const errorSummary = this.summarizeErrors(errors)
      const affectedOperations = [...new Set(errors.map(e => e.operation))]

      const subject = `🚨 OSCAR Integration Alert: ${rule.name}`
      
      const emailContent = `
        <h2>OSCAR Integration Alert: ${rule.name}</h2>
        
        <div style="background-color: #fee; padding: 15px; border-left: 4px solid #e53e3e; margin: 15px 0;">
          <strong>Alert Triggered:</strong> ${errorCount} errors detected in the last ${timeWindow}
        </div>

        <h3>Error Summary</h3>
        <ul>
          ${errorSummary.map(s => `<li><strong>${s.type}:</strong> ${s.count} errors</li>`).join('')}
        </ul>

        <h3>Affected Operations</h3>
        <ul>
          ${affectedOperations.map(op => `<li>${op}</li>`).join('')}
        </ul>

        <h3>Recent Errors</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #f7fafc;">
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Time</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Operation</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Error Type</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Message</th>
            </tr>
          </thead>
          <tbody>
            ${errors.slice(0, 10).map(error => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${error.createdAt.toLocaleString()}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${error.operation}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${error.errorType}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${error.message}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${errors.length > 10 ? `<p><em>Showing 10 of ${errors.length} errors. Check the admin dashboard for full details.</em></p>` : ''}

        <h3>Next Steps</h3>
        <ol>
          <li>Review the admin dashboard for detailed error information</li>
          <li>Check OSCAR API connectivity and authentication</li>
          <li>Monitor error patterns to identify root causes</li>
          <li>Consider temporary fallback procedures if needed</li>
        </ol>

        <p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/notifications" 
             style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            View Admin Dashboard
          </a>
        </p>

        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This alert was triggered by the rule: ${rule.name}<br>
          Threshold: ${rule.threshold} errors in ${rule.timeWindow} minutes<br>
          Generated at: ${context.triggeredAt.toLocaleString()}
        </p>
      `

      // Send email to all recipients
      for (const recipient of rule.emailRecipients) {
        await notificationService.sendNotification({
          type: 'EMAIL',
          to: {
            email: recipient
          },
          subject,
          content: {
            email: emailContent
          },
          priority: 'high'
        })
      }

      await this.logOperation('EMAIL_ALERT_SENT', {
        ruleName: rule.name,
        recipients: rule.emailRecipients.length,
        errorCount
      })

    } catch (error) {
      console.error('Failed to send email alert:', error)
      await this.logOperation('EMAIL_ALERT_ERROR', {
        ruleName: context.rule.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Send escalation alert
   */
  private async sendEscalationAlert(context: AlertContext, recipients: string[]): Promise<void> {
    try {
      const subject = `🔥 URGENT: OSCAR Integration Escalation - ${context.rule.name}`
      
      const emailContent = `
        <h2 style="color: #e53e3e;">🔥 URGENT ESCALATION: ${context.rule.name}</h2>
        
        <div style="background-color: #fed7d7; padding: 20px; border-left: 4px solid #e53e3e; margin: 15px 0;">
          <strong>CRITICAL ALERT:</strong> ${context.errorCount} errors detected in ${context.timeWindow}.<br>
          This exceeds the escalation threshold and requires immediate attention.
        </div>

        <h3>Immediate Action Required</h3>
        <ul>
          <li>🚨 Review OSCAR integration status immediately</li>
          <li>📞 Contact technical team if errors persist</li>
          <li>🔧 Consider activating fallback procedures</li>
          <li>📊 Monitor system health closely</li>
        </ul>

        <p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/notifications" 
             style="background-color: #e53e3e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            🚨 VIEW CRITICAL ALERTS
          </a>
        </p>

        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Escalation triggered at: ${context.triggeredAt.toLocaleString()}<br>
          Rule: ${context.rule.name}<br>
          This is an automated escalation alert.
        </p>
      `

      for (const recipient of recipients) {
        await notificationService.sendNotification({
          type: 'EMAIL',
          to: {
            email: recipient
          },
          subject,
          content: {
            email: emailContent
          },
          priority: 'urgent'
        })
      }

      await this.logOperation('ESCALATION_ALERT_SENT', {
        ruleName: context.rule.name,
        recipients: recipients.length,
        errorCount: context.errorCount
      })

    } catch (error) {
      console.error('Failed to send escalation alert:', error)
    }
  }

  /**
   * Create dashboard alert
   */
  private async createDashboardAlert(context: AlertContext): Promise<void> {
    try {
      const { errors, rule, errorCount } = context
      const primaryError = errors[0]
      const affectedOperations = [...new Set(errors.map(e => e.operation))]

      const alert: DashboardAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: this.getAlertType(primaryError.severity),
        title: rule.name,
        message: `${errorCount} ${primaryError.errorType.toLowerCase().replace('_', ' ')} errors in ${rule.timeWindow} minutes`,
        severity: primaryError.severity,
        errorType: primaryError.errorType,
        errorCount,
        affectedOperations,
        createdAt: new Date(),
        acknowledged: false
      }

      // Store alert (you might want to use a separate alerts table)
      await this.storeDashboardAlert(alert)

      await this.logOperation('DASHBOARD_ALERT_CREATED', {
        alertId: alert.id,
        ruleName: rule.name,
        errorCount,
        severity: alert.severity
      })

    } catch (error) {
      console.error('Failed to create dashboard alert:', error)
    }
  }

  /**
   * Helper methods
   */
  private summarizeErrors(errors: any[]): { type: string; count: number }[] {
    const summary = new Map<string, number>()
    
    for (const error of errors) {
      const current = summary.get(error.errorType) || 0
      summary.set(error.errorType, current + 1)
    }
    
    return Array.from(summary.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }

  private getAlertType(severity: ErrorSeverity): 'error' | 'warning' | 'info' {
    switch (severity) {
      case 'CRITICAL':
      case 'ERROR':
        return 'error'
      case 'WARNING':
        return 'warning'
      default:
        return 'info'
    }
  }

  private getAdminEmails(): string[] {
    const emails = process.env.OSCAR_ADMIN_EMAILS || process.env.ADMIN_EMAILS || ''
    return emails.split(',').map(email => email.trim()).filter(Boolean)
  }

  private getEscalationEmails(): string[] {
    const emails = process.env.OSCAR_ESCALATION_EMAILS || process.env.ESCALATION_EMAILS || ''
    return emails.split(',').map(email => email.trim()).filter(Boolean)
  }

  private generateRuleId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
  }

  private async getActiveRules(): Promise<NotificationRule[]> {
    // For now, return default rules. In production, you might store these in database
    const adminEmails = this.getAdminEmails()
    const escalationEmails = this.getEscalationEmails()

    return this.DEFAULT_RULES.map(rule => ({
      ...rule,
      id: this.generateRuleId(rule.name),
      emailRecipients: adminEmails,
      escalation: rule.escalation ? {
        ...rule.escalation,
        recipients: escalationEmails
      } : undefined
    }))
  }

  private async upsertRule(rule: NotificationRule): Promise<void> {
    // Implementation for storing rules in database
    // For now, we use in-memory rules
  }

  private async storeDashboardAlert(alert: DashboardAlert): Promise<void> {
    // Store alert in database or cache for dashboard display
    // This could be a separate alerts table or use existing audit log
    await this.logOperation('DASHBOARD_ALERT', {
      alertId: alert.id,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      errorType: alert.errorType,
      errorCount: alert.errorCount,
      affectedOperations: alert.affectedOperations
    })
  }

  /**
   * Public API methods for dashboard/admin interface
   */
  public async getNotificationStats(): Promise<NotificationStats> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Get recent errors for basic stats
    const recentErrors = await prisma.oscarErrorLog.findMany({
      where: { createdAt: { gte: twentyFourHoursAgo } }
    })

    const criticalErrors = recentErrors.filter(e => 
      e.severity === 'CRITICAL' || e.severity === 'ERROR'
    ).length

    // Get error type counts
    const errorTypeCounts: { type: OscarErrorType; count: number }[] = []
    const errorTypeMap = new Map<OscarErrorType, number>()
    
    recentErrors.forEach(error => {
      const current = errorTypeMap.get(error.errorType) || 0
      errorTypeMap.set(error.errorType, current + 1)
    })
    
    Array.from(errorTypeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([type, count]) => {
        errorTypeCounts.push({ type, count })
      })

    // Get operation counts
    const operationCounts: { operation: string; count: number }[] = []
    const operationMap = new Map<string, number>()
    
    recentErrors.forEach(error => {
      const current = operationMap.get(error.operation) || 0
      operationMap.set(error.operation, current + 1)
    })
    
    Array.from(operationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([operation, count]) => {
        operationCounts.push({ operation, count })
      })

    return {
      alertsSent24h: recentErrors.filter(e => e.notificationSent).length,
      criticalErrors24h: criticalErrors,
      unacknowledgedAlerts: 0, // Would come from alerts table
      topErrorTypes: errorTypeCounts,
      affectedOperations: operationCounts
    }
  }

  public async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    try {
      // Implementation for acknowledging alerts
      await this.logOperation('ALERT_ACKNOWLEDGED', {
        alertId,
        acknowledgedBy
      })
      return true
    } catch (error) {
      return false
    }
  }

  public async resolveError(errorId: string, resolvedBy: string, resolution: string): Promise<boolean> {
    try {
      await prisma.oscarErrorLog.update({
        where: { id: errorId },
        data: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy,
          resolution
        }
      })

      await this.logOperation('ERROR_RESOLVED', {
        errorId,
        resolvedBy,
        resolution
      })

      return true
    } catch (error) {
      return false
    }
  }

  private async logOperation(operation: string, details: any): Promise<void> {
    try {
      await auditLog({
        action: `OSCAR_ADMIN_NOTIFICATIONS_${operation}`,
        userId: 'system',
        userEmail: 'oscar-admin-notifications',
        resource: 'oscar_notifications',
        details: {
          service: 'OscarAdminNotifications',
          operation,
          ...details
        },
        ipAddress: 'system',
        userAgent: 'oscar-admin-notifications'
      })
    } catch (error) {
      console.error('Failed to log operation:', error)
    }
  }
}

// Export singleton instance
export const oscarAdminNotifications = OscarAdminNotifications.getInstance() 