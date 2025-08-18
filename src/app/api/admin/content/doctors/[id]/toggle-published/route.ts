import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/content/doctors/[id]/toggle-published - Toggle published status
export async function PUT(
  request: Request,
  { params }: any,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { published } = body;

    if (typeof published !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Published status is required' },
        { status: 400 }
      );
    }

    // Update team member published status
    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: { published }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...teamMember,
        createdAt: teamMember.createdAt.toISOString(),
        updatedAt: teamMember.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to toggle published status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle published status' },
      { status: 500 }
    );
  }
}
