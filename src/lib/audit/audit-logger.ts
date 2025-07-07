import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuditLogData {
  action: string
  userId?: string
  userEmail?: string
  resource?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export interface SecurityAuditData extends AuditLogData {
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  threatType?: string
  blocked?: boolean
  riskScore?: number
}

/**
 * Primary audit logging function
 * Logs actions to the database for compliance and security monitoring
 */
export async function auditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId || null,
        resource: data.resource || 'unknown',
        resourceId: data.resourceId || null,
        details: data.details ? JSON.parse(JSON.stringify(data.details)) : null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        timestamp: new Date()
      }
    })
  } catch (error) {
    // Log to console as fallback, but don't throw to avoid breaking business logic
    console.error('Audit log error:', error)
    console.error('Failed to log audit data:', data)
  }
}

/**
 * Security-specific audit logging with enhanced metadata
 */
export async function securityAuditLog(data: SecurityAuditData): Promise<void> {
  const enhancedDetails = {
    ...data.details,
    security: {
      severity: data.severity || 'MEDIUM',
      threatType: data.threatType,
      blocked: data.blocked || false,
      riskScore: data.riskScore || 0
    }
  }

  await auditLog({
    ...data,
    action: `SECURITY_${data.action}`,
    resource: data.resource || 'security',
    details: enhancedDetails
  })
}

/**
 * HIPAA-specific audit logging
 * Ensures compliance with HIPAA audit requirements
 */
export async function hipaaAuditLog(data: AuditLogData & {
  phi_accessed?: boolean
  patient_id?: string
  authorization_basis?: string
}): Promise<void> {
  const hipaaDetails = {
    ...data.details,
    hipaa: {
      phi_accessed: data.phi_accessed || false,
      patient_id: data.patient_id,
      authorization_basis: data.authorization_basis || 'treatment',
      compliance_framework: 'HIPAA'
    }
  }

  await auditLog({
    ...data,
    action: `HIPAA_${data.action}`,
    resource: data.resource || 'phi',
    details: hipaaDetails
  })
}

/**
 * Batch audit logging for performance
 */
export async function batchAuditLog(logs: AuditLogData[]): Promise<void> {
  try {
    await prisma.auditLog.createMany({
      data: logs.map(log => ({
        action: log.action,
        userId: log.userId || null,
        resource: log.resource || 'unknown',
        resourceId: log.resourceId || null,
        details: log.details ? JSON.parse(JSON.stringify(log.details)) : null,
        ipAddress: log.ipAddress || null,
        userAgent: log.userAgent || null,
        timestamp: new Date()
      }))
    })
  } catch (error) {
    console.error('Batch audit log error:', error)
    console.error('Failed to log batch audit data:', logs)
  }
}

/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(filters: {
  userId?: string
  action?: string
  resource?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const where: any = {}

  if (filters.userId) where.userId = filters.userId
  if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' }
  if (filters.resource) where.resource = { contains: filters.resource, mode: 'insensitive' }
  if (filters.startDate || filters.endDate) {
    where.timestamp = {}
    if (filters.startDate) where.timestamp.gte = filters.startDate
    if (filters.endDate) where.timestamp.lte = filters.endDate
  }

  return await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: filters.limit || 100,
    skip: filters.offset || 0,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    }
  })
}

/**
 * Get audit statistics
 */
export async function getAuditStats(timeframe: 'day' | 'week' | 'month' = 'day') {
  const now = new Date()
  const startDate = new Date()

  switch (timeframe) {
    case 'day':
      startDate.setDate(now.getDate() - 1)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
  }

  const [
    totalLogs,
    securityLogs,
    hipaaLogs,
    failedActions,
    uniqueUsers
  ] = await Promise.all([
    prisma.auditLog.count({
      where: { timestamp: { gte: startDate } }
    }),
    prisma.auditLog.count({
      where: {
        timestamp: { gte: startDate },
        action: { startsWith: 'SECURITY_' }
      }
    }),
    prisma.auditLog.count({
      where: {
        timestamp: { gte: startDate },
        action: { startsWith: 'HIPAA_' }
      }
    }),
    prisma.auditLog.count({
      where: {
        timestamp: { gte: startDate },
        details: {
          path: ['success'],
          equals: false
        }
      }
    }),
    prisma.auditLog.findMany({
      where: { timestamp: { gte: startDate } },
      select: { userId: true },
      distinct: ['userId']
    })
  ])

  return {
    timeframe,
    startDate,
    endDate: now,
    totalLogs,
    securityLogs,
    hipaaLogs,
    failedActions,
    uniqueUsers: uniqueUsers.length
  }
}

/**
 * Cleanup old audit logs (for data retention compliance)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 2555) { // ~7 years default for HIPAA
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const deleted = await prisma.auditLog.deleteMany({
    where: {
      timestamp: { lt: cutoffDate }
    }
  })

  await auditLog({
    action: 'AUDIT_LOG_CLEANUP',
    resource: 'audit_logs',
    details: {
      deleted_count: deleted.count,
      cutoff_date: cutoffDate,
      retention_days: retentionDays
    },
    ipAddress: 'system',
    userAgent: 'audit-cleanup-service'
  })

  return deleted.count
}

// Common audit actions
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',

  // Patient Data
  PATIENT_INTAKE_CREATED: 'PATIENT_INTAKE_CREATED',
  PATIENT_INTAKE_VIEWED: 'PATIENT_INTAKE_VIEWED',
  PATIENT_INTAKE_UPDATED: 'PATIENT_INTAKE_UPDATED',
  PATIENT_DATA_EXPORT: 'PATIENT_DATA_EXPORT',

  // Appointments
  APPOINTMENT_BOOKING_ATTEMPT: 'APPOINTMENT_BOOKING_ATTEMPT',
  APPOINTMENT_CREATED: 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED: 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',

  // System
  DATA_BACKUP: 'DATA_BACKUP',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  CONFIGURATION_CHANGE: 'CONFIGURATION_CHANGE',

  // Security
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  DATA_BREACH_ATTEMPT: 'DATA_BREACH_ATTEMPT'
} as const

export default auditLog 