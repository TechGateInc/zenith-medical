/**
 * Admin Intake Count API Route
 * Returns count of unviewed patient intake submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { AdminRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(session.user.role as AdminRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count unviewed submissions (where viewedAt is null)
    const unviewedCount = await prisma.patientIntake.count({
      where: {
        viewedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      count: unviewedCount
    });

  } catch (error) {
    console.error('Error fetching unviewed intake count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 