/**
 * Individual Team Member API Routes
 * Handles operations for specific team members by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth/config';
import { prisma } from '../../../../../../lib/prisma';
import { auditLog } from '../../../../../../lib/audit/audit-logger';
import { z } from 'zod';
import { deleteImage } from '../../../../../../lib/cloudinary/image-upload';

// Validation schema for team member updates
const TeamMemberUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  orderIndex: z.number().int().min(0).optional(),
  published: z.boolean().optional()
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch specific team member
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    // Fetch team member
    const teamMember = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog({
      userId: session.user?.id,
      action: 'READ',
      resource: 'team_members',
      resourceId: id,
      details: { teamMember: { id: teamMember.id, name: teamMember.name } }
    });

    return NextResponse.json({
      success: true,
      data: teamMember
    });

  } catch (error) {
    console.error('Failed to fetch team member:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch team member',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update specific team member
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    // Check if team member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = TeamMemberUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check if name already exists (if name is being updated)
    if (updateData.name && updateData.name !== existingMember.name) {
      const duplicateMember = await prisma.teamMember.findFirst({
        where: {
          name: updateData.name,
          id: { not: id }
        }
      });

      if (duplicateMember) {
        return NextResponse.json(
          { error: 'A team member with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Handle photo URL change - delete old image if changed
    if (updateData.photoUrl !== undefined && 
        existingMember.photoUrl && 
        updateData.photoUrl !== existingMember.photoUrl) {
      try {
        // Extract public ID from old photo URL
        const oldPhotoUrl = existingMember.photoUrl;
        if (oldPhotoUrl.includes('cloudinary.com')) {
          const publicIdMatch = oldPhotoUrl.match(/\/v\d+\/(.+)\./);
          if (publicIdMatch) {
            await deleteImage(publicIdMatch[1]);
          }
        }
      } catch (deleteError) {
        console.warn('Failed to delete old team member photo:', deleteError);
        // Don't fail the update if image deletion fails
      }
    }

    // Update team member
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: updateData
    });

    // Audit log
    await auditLog({
      userId: session.user?.id,
      action: 'UPDATE',
      resource: 'team_members',
      resourceId: id,
      details: { 
        before: existingMember,
        after: updatedMember,
        changes: updateData
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: 'Team member updated successfully'
    });

  } catch (error) {
    console.error('Failed to update team member:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update team member',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific team member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    // Check if team member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Delete associated photo from Cloudinary if exists
    if (existingMember.photoUrl) {
      try {
        const photoUrl = existingMember.photoUrl;
        if (photoUrl.includes('cloudinary.com')) {
          const publicIdMatch = photoUrl.match(/\/v\d+\/(.+)\./);
          if (publicIdMatch) {
            await deleteImage(publicIdMatch[1]);
          }
        }
      } catch (deleteError) {
        console.warn('Failed to delete team member photo:', deleteError);
        // Don't fail the deletion if image deletion fails
      }
    }

    // Delete team member
    await prisma.teamMember.delete({
      where: { id }
    });

    // Reorder remaining team members to fill gaps
    const remainingMembers = await prisma.teamMember.findMany({
      where: { orderIndex: { gt: existingMember.orderIndex } },
      orderBy: { orderIndex: 'asc' }
    });

    // Update order indices
    for (let i = 0; i < remainingMembers.length; i++) {
      await prisma.teamMember.update({
        where: { id: remainingMembers[i].id },
        data: { orderIndex: existingMember.orderIndex + i }
      });
    }

    // Audit log
    await auditLog({
      userId: session.user?.id,
      action: 'DELETE',
      resource: 'team_members',
      resourceId: id,
      details: { 
        deletedMember: existingMember,
        reorderedCount: remainingMembers.length
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete team member:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete team member',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 