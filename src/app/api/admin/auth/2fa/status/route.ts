import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's 2FA status
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        twoFactorEnabled: true,
        twoFactorBackupCodes: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      enabled: user.twoFactorEnabled,
      hasBackupCodes: user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0,
      backupCodesCount: user.twoFactorBackupCodes?.length || 0
    });

  } catch (error) {
    console.error('2FA status check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check 2FA status'
    }, { status: 500 });
  }
} 