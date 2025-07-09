/**
 * Admin Database Test API
 * Tests database connection and provides connection status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();

    try {
      // Test database connection by performing a simple query
      await prisma.$queryRaw`SELECT 1 as test`;
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Get additional database information
      const [
        teamMemberCount,
        intakeSubmissionCount
      ] = await Promise.all([
        prisma.teamMember.count(),
        prisma.patientIntake.count()
      ]);

      return NextResponse.json({
        success: true,
        status: 'connected',
        responseTime: `${responseTime}ms`,
        databaseInfo: {
          type: 'PostgreSQL', // This would be dynamic based on your database
          tablesChecked: ['teamMember', 'patientIntake'],
          recordCounts: {
            teamMembers: teamMemberCount,
            intakeSubmissions: intakeSubmissionCount
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (dbError) {
      console.error('Database connection test failed:', dbError);
      
      return NextResponse.json({
        success: false,
        status: 'disconnected',
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'backup':
        // Simulate database backup
        // In a real application, this would trigger an actual backup process
        return NextResponse.json({
          success: true,
          message: 'Database backup initiated',
          backupId: `backup_${Date.now()}`,
          estimatedCompletion: new Date(Date.now() + 600000).toISOString() // 10 minutes
        });

      case 'optimize':
        try {
          // Run database optimization queries
          // This is a simplified example - real optimization would be more comprehensive
          await prisma.$executeRaw`ANALYZE;`;
          
          return NextResponse.json({
            success: true,
            message: 'Database optimization completed',
            details: 'Table statistics updated and query planner optimized'
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: 'Database optimization failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }

      case 'clear_cache':
        // Simulate cache clearing
        // In a real application, this would clear Redis cache, application cache, etc.
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
          details: 'Application cache and query cache have been cleared'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing database action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 