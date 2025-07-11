/**
 * Admin Intake API Routes
 * Handles listing and managing patient intake submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { markMultipleIntakesAsViewed } from '@/lib/utils/intake-counter';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFilter = searchParams.get('dateFilter');

    // Build where clause for filtering
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { legalFirstName: { contains: search, mode: 'insensitive' } },
        { legalLastName: { contains: search, mode: 'insensitive' } },
        { preferredName: { contains: search, mode: 'insensitive' } },
        { emailAddress: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } }
      ];
    }

    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      where.createdAt = {
        gte: startDate
      };
    }

    // Get submissions with pagination
    const [submissions, totalCount] = await Promise.all([
      prisma.patientIntake.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          legalFirstName: true,
          legalLastName: true,
          preferredName: true,
          emailAddress: true,
          phoneNumber: true,
          status: true,
          appointmentBooked: true,
          createdAt: true,
          updatedAt: true,
          viewedAt: true
        }
      }),
      prisma.patientIntake.count({ where })
    ]);

    // Mark unviewed submissions as viewed
    const unviewedSubmissionIds = submissions
      .filter(submission => !submission.viewedAt)
      .map(submission => submission.id);
    
    if (unviewedSubmissionIds.length > 0) {
      await markMultipleIntakesAsViewed(unviewedSubmissionIds);
    }

    return NextResponse.json({
      success: true,
      submissions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching intake submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 