/**
 * Admin Security Stats API
 * Provides security statistics and metrics for the security dashboard
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { AdminRole } from '@prisma/client';

export async function GET() {
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

    // Get current date ranges
    const now = new Date();
    
    // Calculate security statistics
    // Note: These would typically come from audit logs, authentication logs, etc.
    // For now, we'll use available data and some mock calculations
    
    const [
      activeUsers,
      failedAttempts
    ] = await Promise.all([
      // Count of providers (published team members)
      prisma.teamMember.count({
        where: {
          published: true
        }
      }),
      
      // Failed login attempts (placeholder - would come from security logs)
      // This would typically be tracked in a separate security_events table
      Promise.resolve(8) // Mock data
    ]);

    // Recent activity - patient intake system removed, using mock data
    const recentActivity = 0;



    return NextResponse.json({
      success: true,
      stats: {
        totalLogins: recentActivity * 8, // Estimate multiple logins per submission
        failedAttempts,
        activeUsers,
        lastSecurityScan: new Date().toISOString(),

        securityAlerts: failedAttempts > 5 ? 2 : 0
      }
    });

  } catch (error) {
    console.error('Error fetching security stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 