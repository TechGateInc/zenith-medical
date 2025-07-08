/**
 * Admin Appointments Providers API
 * Manages healthcare providers who accept appointments
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

    // Get current date for today's appointments
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Get all providers (team members who are providers)
    const providers = await prisma.teamMember.findMany({
      where: {
        isProvider: true
      },
      select: {
        id: true,
        name: true,
        specialization: true,
        isActive: true,
        email: true,
        phone: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // For each provider, get today's appointment count
    const providersWithStats = await Promise.all(
      providers.map(async (provider) => {
        // Count today's appointments for this provider
        // Since we don't have a direct provider-appointment relationship yet,
        // we'll use a placeholder count based on intake submissions
        const todayAppointments = await prisma.intakeSubmission.count({
          where: {
            status: 'APPOINTMENT_SCHEDULED',
            updatedAt: {
              gte: startOfToday,
              lte: endOfToday
            }
            // TODO: Add provider assignment when that field exists
          }
        });

        return {
          id: provider.id,
          name: provider.name,
          specialization: provider.specialization || 'General Practice',
          status: provider.isActive ? 'active' : 'inactive',
          email: provider.email,
          phone: provider.phone,
          todayAppointments: Math.floor(todayAppointments / providers.length) // Distribute evenly for now
        };
      })
    );

    return NextResponse.json({
      success: true,
      providers: providersWithStats
    });

  } catch (error) {
    console.error('Error fetching providers:', error);
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
    const { name, specialization, email, phone, isActive = true } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create new provider (team member)
    const provider = await prisma.teamMember.create({
      data: {
        name,
        specialization,
        email,
        phone,
        isActive,
        isProvider: true,
        role: 'Healthcare Provider',
        bio: `${specialization} specialist at Zenith Medical Centre`,
        imageUrl: null // Will be set later if needed
      }
    });

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        specialization: provider.specialization,
        status: provider.isActive ? 'active' : 'inactive',
        email: provider.email,
        phone: provider.phone,
        todayAppointments: 0
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 