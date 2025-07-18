/**
 * Admin Security Events API
 * Provides security events and audit logs for the security dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');

    // Mock security events data
    // In a real application, this would come from a security_events table
    // or external security monitoring system
    const allEvents = [
      {
        id: '1',
        type: 'login',
        user: session.user?.email || 'admin@zenithmedical.ca',
        description: 'Successful admin login',
        timestamp: new Date().toISOString(),
        severity: 'low',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      {
        id: '2',
        type: 'failed_login',
        user: 'unknown@example.com',
        description: 'Failed login attempt - invalid credentials',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: 'medium',
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        id: '3',
        type: 'admin_action',
        user: session.user?.email || 'admin@zenithmedical.ca',
        description: 'Updated system settings',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        severity: 'low',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      {
        id: '4',
        type: 'security_alert',
        user: 'System',
        description: 'Multiple failed login attempts detected from same IP',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        severity: 'high',
        ipAddress: '203.0.113.45',
        userAgent: null
      },
      {
        id: '5',
        type: 'data_access',
        user: session.user?.email || 'admin@zenithmedical.ca',
        description: 'Accessed patient intake records',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        severity: 'low',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      {
        id: '6',
        type: 'failed_login',
        user: 'test@example.com',
        description: 'Failed login attempt - account locked',
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        severity: 'medium',
        ipAddress: '198.51.100.25',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)'
      },
      {
        id: '7',
        type: 'admin_action',
        user: session.user?.email || 'admin@zenithmedical.ca',
        description: 'Created new team member',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        severity: 'low',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      {
        id: '8',
        type: 'security_alert',
        user: 'System',
        description: 'Suspicious file upload attempt blocked',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        severity: 'critical',
        ipAddress: '185.220.101.45',
        userAgent: 'curl/7.68.0'
      }
    ];

    // Filter events based on query parameters
    let filteredEvents = allEvents;

    if (severity && severity !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }

    if (type && type !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    // Limit results
    const events = filteredEvents.slice(0, limit);

    return NextResponse.json({
      success: true,
      events,
      total: filteredEvents.length
    });

  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 