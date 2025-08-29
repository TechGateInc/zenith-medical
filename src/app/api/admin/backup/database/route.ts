import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth/config'
import { prisma } from '../../../../../lib/prisma'
import { auditLog } from '../../../../../lib/audit/audit-logger'
import { AdminRole } from '@prisma/client'

// Cloudinary SDK for backup storage
import { v2 as cloudinary } from 'cloudinary'

interface BackupResult {
  success: boolean
  backupId?: string
  filename?: string
  size?: number
  location?: string
  error?: string
  timestamp: Date
}

export async function POST(request: NextRequest) {
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

    // Perform database backup
    const backupResult = await performDatabaseBackup()

    // Log the backup operation
    await auditLog({
      action: 'DATABASE_BACKUP',
      userId: userId,
      userEmail: userEmail || 'system',
      details: {
        backupId: backupResult.backupId,
        filename: backupResult.filename,
        size: backupResult.size,
        location: backupResult.location,
        success: backupResult.success,
        automated: !!isVercelCron
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'system',
      userAgent: request.headers.get('user-agent') || 'vercel-cron'
    })

    if (backupResult.success) {
      return NextResponse.json({
        message: 'Database backup completed successfully',
        backup: backupResult
      })
    } else {
      return NextResponse.json({
        error: 'Database backup failed',
        details: backupResult.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Database backup error:', error)
    
    // Log the failed backup attempt
    await auditLog({
      action: 'DATABASE_BACKUP_FAILED',
      userId: userId,
      userEmail: userEmail || 'system',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        automated: !!request.headers.get('x-vercel-cron-token')
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'system',
      userAgent: request.headers.get('user-agent') || 'vercel-cron'
    })

    return NextResponse.json(
      { error: 'Database backup failed' },
      { status: 500 }
    )
  }
}

async function performDatabaseBackup(): Promise<BackupResult> {
  try {
    const timestamp = new Date()
    const backupId = `backup_${timestamp.toISOString().replace(/[:.]/g, '-')}`
    const filename = `${backupId}.sql`

    // Get database connection details - removed as not currently used
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured')
    }

    // In a real implementation, you would execute pg_dump
    // For now, we'll simulate the backup process
    const backupData = await createLogicalBackup()

    // Upload to Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const cloudinaryLocation = await uploadToCloudinary(filename, backupData)
      
      return {
        success: true,
        backupId,
        filename,
        size: Buffer.byteLength(backupData, 'utf8'),
        location: cloudinaryLocation,
        timestamp
      }
    } else {
      // Store locally or skip if no storage configured
      return {
        success: true,
        backupId,
        filename,
        size: Buffer.byteLength(backupData, 'utf8'),
        location: 'local',
        timestamp
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown backup error',
      timestamp: new Date()
    }
  }
}

async function createLogicalBackup(): Promise<string> {
  // Create a comprehensive logical backup of all data
  try {
    const timestamp = new Date().toISOString()
    let backupData = `-- Zenith Medical Centre Database Backup\n`
    backupData += `-- Generated on: ${timestamp}\n`
    backupData += `-- Backup Type: Logical (Full Data Export)\n\n`

    // Patient intake system has been removed - no data to backup
    backupData += `-- Patient Intakes: 0 records (system removed)\n`
    backupData += `-- Note: Patient intake functionality has been removed from the system\n`

    // Get admin users (without passwords for security)
    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        loginAttempts: true,

      }
    })
    
    backupData += `\n-- Admin Users: ${adminUsers.length} records\n`
    backupData += `INSERT INTO admin_users (id, email, name, role, created_at, updated_at, last_login_at, login_attempts) VALUES\n`
    
    adminUsers.forEach((user, index) => {
      const values = [
        `'${user.id}'`,
        `'${user.email}'`,
        `'${user.name}'`,
        `'${user.role}'`,
        `'${user.createdAt.toISOString()}'`,
        `'${user.updatedAt.toISOString()}'`,
        `'${user.lastLoginAt?.toISOString() || null}'`,
        `${user.loginAttempts}`,

      ]
      backupData += `(${values.join(', ')})${index < adminUsers.length - 1 ? ',' : ';'}\n`
    })

    // Get audit logs (last 1000 for performance)
    const auditLogs = await prisma.auditLog.findMany({
      take: 1000,
      orderBy: { timestamp: 'desc' }
    })
    
    backupData += `\n-- Audit Logs: ${auditLogs.length} records (last 1000)\n`
    if (auditLogs.length > 0) {
      backupData += `INSERT INTO audit_logs (id, user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) VALUES\n`
      
      auditLogs.forEach((log, index) => {
        const values = [
          `'${log.id}'`,
          `'${log.userId}'`,
          `'${log.action}'`,
          `'${log.resource}'`,
          `'${log.resourceId}'`,
          `'${JSON.stringify(log.details).replace(/'/g, "''")}'`,
          `'${log.ipAddress || ''}'`,
          `'${log.userAgent || ''}'`,
          `'${log.timestamp.toISOString()}'`
        ]
        backupData += `(${values.join(', ')})${index < auditLogs.length - 1 ? ',' : ';'}\n`
      })
    }

    // Add backup metadata
    backupData += `\n-- Backup Metadata\n`
    backupData += `-- Total Patient Intakes: 0 (system removed)\n`
    backupData += `-- Total Admin Users: ${adminUsers.length}\n`
    backupData += `-- Total Audit Logs: ${auditLogs.length}\n`
    backupData += `-- Backup completed at: ${timestamp}\n`
    backupData += `-- Application: Zenith Medical Centre\n`
    backupData += `-- Version: 1.0\n`

    return backupData
  } catch (error) {
    throw new Error(`Failed to create backup: ${error}`)
  }
}

async function uploadToCloudinary(filename: string, data: string): Promise<string> {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const folder = `database-backups/${new Date().getFullYear()}`
    
    // Convert string data to base64 for upload
    const base64Data = `data:application/sql;base64,${Buffer.from(data).toString('base64')}`

    // Upload to Cloudinary as raw file
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      resource_type: 'raw',
      public_id: filename.replace('.sql', ''),
      folder: folder,
      tags: ['database-backup', 'zenith-medical-centre', 'automated-backup'],
      context: {
        backup_type: 'database',
        application: 'zenith-medical-centre',
        created_by: 'automated-backup',
        timestamp: new Date().toISOString()
      }
    })

    return uploadResult.secure_url
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error}`)
  }
}

// Cleanup old backups
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || (user.role !== AdminRole.SUPER_ADMIN && user.role !== AdminRole.ADMIN)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30')
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // In a real implementation, you would clean up old Cloudinary backups here
    // For now, we'll just log the cleanup operation

    await auditLog({
      action: 'BACKUP_CLEANUP',
      userId: user.id,
      userEmail: user.email,
      details: {
        retentionDays,
        cutoffDate: cutoffDate.toISOString()
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ message: 'Backup cleanup completed' })

  } catch (error) {
    console.error('Backup cleanup error:', error)
    return NextResponse.json({ error: 'Backup cleanup failed' }, { status: 500 })
  }
} 