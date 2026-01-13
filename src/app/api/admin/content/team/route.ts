/**
 * Team Member API Routes
 * Handles CRUD operations for team members
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth/config';
import { prisma } from '../../../../../lib/prisma';
import { auditLog } from '../../../../../lib/audit/audit-logger';
import { z } from 'zod';

// Validation schema for team member data
const TeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  
  orderIndex: z.number().int().min(0).default(0),
  published: z.boolean().default(true)
});

// GET - Fetch all team members
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const orderBy = searchParams.get('orderBy') || 'orderIndex';
    const orderDirection = searchParams.get('orderDirection') || 'asc';
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const statsOnly = searchParams.get('stats') === 'true';

    // Build where clause for Prisma's dynamic where conditions
    const where: NonNullable<Parameters<typeof prisma.teamMember.findMany>[0]>['where'] = {};
    
    if (published !== null) {
      where.published = published === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },

      ];
    }

    // Build query options for Prisma's dynamic query building
    const queryOptions: Parameters<typeof prisma.teamMember.findMany>[0] = {
      where,
      orderBy: {
        [orderBy]: orderDirection
      }
    };

    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    if (offset) {
      queryOptions.skip = parseInt(offset);
    }

    // If stats only, return just counts
    if (statsOnly) {
      const totalCount = await prisma.teamMember.count({ where });
      const publishedCount = await prisma.teamMember.count({ 
        where: { ...where, published: true } 
      });
      
      return NextResponse.json({
        success: true,
        stats: {
          total: totalCount,
          published: publishedCount,
          draft: totalCount - publishedCount
        }
      });
    }

    // Fetch team members
    const [teamMembers, totalCount] = await Promise.all([
      prisma.teamMember.findMany(queryOptions),
      prisma.teamMember.count({ where })
    ]);

    // Audit log
    await auditLog({
      userId: session.user?.id,
      action: 'READ',
      resource: 'team_members',
      details: { 
        count: teamMembers.length,
        filters: { published, search, orderBy, orderDirection }
      }
    });

    return NextResponse.json({
      success: true,
      data: teamMembers,
      pagination: {
        total: totalCount,
        limit: limit ? parseInt(limit) : teamMembers.length,
        offset: offset ? parseInt(offset) : 0
      }
    });

  } catch (error) {
    console.error('Failed to fetch team members:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch team members',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new team member
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = TeamMemberSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const teamMemberData = validationResult.data;

    // Check if name already exists
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        name: teamMemberData.name
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'A team member with this name already exists' },
        { status: 409 }
      );
    }

    // If no orderIndex provided, set to highest + 1
    if (!body.orderIndex) {
      const maxOrder = await prisma.teamMember.findFirst({
        select: { orderIndex: true },
        orderBy: { orderIndex: 'desc' }
      });
      teamMemberData.orderIndex = (maxOrder?.orderIndex || 0) + 1;
    }

    // Create team member
    const newTeamMember = await prisma.teamMember.create({
      data: teamMemberData
    });

    // Audit log
    await auditLog({
      userId: session.user?.id,
      action: 'CREATE',
      resource: 'team_members',
      resourceId: newTeamMember.id,
      details: { teamMember: newTeamMember }
    });

    return NextResponse.json({
      success: true,
      data: newTeamMember,
      message: 'Team member created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create team member:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create team member',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Bulk update team members (for reordering)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array' },
        { status: 400 }
      );
    }

    // Validate each update
    const validUpdates = [];
    for (const update of updates) {
      if (!update.id || typeof update.orderIndex !== 'number') {
        return NextResponse.json(
          { error: 'Each update must have id and orderIndex' },
          { status: 400 }
        );
      }
      validUpdates.push(update);
    }

    // Perform bulk update
    const updatePromises = validUpdates.map(update =>
      prisma.teamMember.update({
        where: { id: update.id },
        data: { orderIndex: update.orderIndex }
      })
    );

    const updatedMembers = await Promise.all(updatePromises);

    // Audit log
    await auditLog({
      userId: session.user?.id,
      action: 'UPDATE',
      resource: 'team_members',
      details: { 
        bulkUpdate: true,
        updatedCount: updatedMembers.length,
        updates: validUpdates
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedMembers,
      message: 'Team members updated successfully'
    });

  } catch (error) {
    console.error('Failed to update team members:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update team members',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 