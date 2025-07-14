import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit/audit-logger';
import { AdminRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details and verify admin permissions
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    });

    if (!user || !user.role || (user.role !== AdminRole.SUPER_ADMIN && user.role !== AdminRole.ADMIN)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Trigger the backup by calling the existing backup endpoint
    const backupResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/backup/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'manual-backup-trigger'
      }
    });

    if (!backupResponse.ok) {
      const errorData = await backupResponse.json();
      throw new Error(errorData.error || 'Backup failed');
    }

    const backupResult = await backupResponse.json();

    // Log the manual backup operation
    await auditLog({
      action: 'MANUAL_DATABASE_BACKUP',
      userId: user.id,
      userEmail: user.email,
      details: {
        backupId: backupResult.backup?.backupId,
        filename: backupResult.backup?.filename,
        size: backupResult.backup?.size,
        location: backupResult.backup?.location,
        success: true,
        triggered: 'manual'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Database backup completed successfully',
      backup: backupResult.backup
    });

  } catch (error) {
    console.error('Manual backup error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Backup failed'
    }, { status: 500 });
  }
} 