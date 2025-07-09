/**
 * Admin Appointments Stats API
 * Provides appointment statistics for the appointments dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date ranges
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Note: Since we don't have an appointments table yet, we'll calculate stats
    // based on patient intake submissions with appointment status
    const [
      totalProviders,
      todayAppointments,
      pendingConfirmation,
      upcomingWeek,
      completedToday,
      cancelledToday
    ] = await Promise.all([
      // Count of providers (published team members)
      prisma.teamMember.count({
        where: {
          published: true
        }
      }),
      
      // Today's appointments (scheduled patient intakes)
      prisma.patientIntake.count({
        where: {
          status: 'APPOINTMENT_SCHEDULED',
          updatedAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      
      // Pending confirmation (reviewed but not scheduled)
      prisma.patientIntake.count({
        where: {
          status: 'REVIEWED'
        }
      }),
      
      // Upcoming this week
      prisma.patientIntake.count({
        where: {
          status: 'APPOINTMENT_SCHEDULED',
          updatedAt: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      }),
      
      // Completed today
      prisma.patientIntake.count({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      
      // Cancelled today
      prisma.patientIntake.count({
        where: {
          status: 'CANCELLED',
          updatedAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalProviders,
        todayAppointments,
        pendingConfirmation,
        upcomingWeek,
        completedToday,
        cancelledToday
      }
    });

  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 