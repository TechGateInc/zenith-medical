import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { AdminRole } from '@prisma/client';

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    });

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // For now, return mock data since the notification system uses mock data
    // In a real implementation, this would query the database for pending notifications
    const mockNotifications = [
      { id: '1', status: 'pending' },
      { id: '2', status: 'scheduled' },
      { id: '3', status: 'sent' },
      { id: '4', status: 'failed' },
      { id: '5', status: 'pending' }
    ];

    // Count pending and scheduled notifications
    const pendingCount = mockNotifications.filter(n => 
      n.status === 'pending' || n.status === 'scheduled'
    ).length;

    return NextResponse.json({
      success: true,
      count: pendingCount
    });

  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 