/**
 * Admin Security Export API
 * Exports security logs and audit data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit/audit-logger';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to verify current role
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Log the export action
    await auditLog({
      action: 'EXPORT_SECURITY_LOGS',
      userId: user.role === 'ADMIN' ? 'admin' : 'super_admin',
      userEmail: session.user.email,
      details: {
        format,
        days,
        recordCount: auditLogs.length
      }
    });

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = 'Timestamp,Action,User,Email,IP Address,Details,Status\n';
      const csvContent = auditLogs.map(log => {
        const timestamp = new Date(log.timestamp).toISOString();
        const action = log.action || '';
        const userId = log.userId || '';
        // Extract userEmail from details if available
        const userEmail = (log.details as any)?.userEmail || (log.details as any)?.email || '';
        const ipAddress = log.ipAddress || '';
        const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
        // Extract success status from details or assume success if no explicit failure
        const status = (log.details as any)?.success !== false ? 'Success' : 'Failed';
        
        return `"${timestamp}","${action}","${userId}","${userEmail}","${ipAddress}","${details}","${status}"`;
      }).join('\n');

      const csvData = csvHeaders + csvContent;
      const filename = `security-logs-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } else {
      // Return JSON format
      return NextResponse.json({
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          },
          recordCount: auditLogs.length,
          logs: auditLogs.map(log => ({
            timestamp: log.timestamp,
            action: log.action,
            userId: log.userId,
            userEmail: (log.details as any)?.userEmail || (log.details as any)?.email || null,
            ipAddress: log.ipAddress,
            details: log.details,
            success: (log.details as any)?.success !== false
          }))
        }
      });
    }

  } catch (error) {
    console.error('Error exporting security logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 