/**
 * Admin Blog Tags API
 * Manages blog tags for content organization
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
    const stats = searchParams.get('stats');
    const limit = searchParams.get('limit');

    if (stats === 'true') {
      // Return statistics
      const totalTags = await prisma.blogTag.count();

      return NextResponse.json({
        success: true,
        stats: {
          total: totalTags
        }
      });
    }

    // Build query options
    const queryOptions: any = {
      include: {
        _count: {
          select: {
            blogPosts: {
              where: {
                blogPost: {
                  published: true
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc' as const
      }
    };

    // Add limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        queryOptions.take = limitNum;
      }
    }

    // Fetch tags with blog post counts
    const tags = await prisma.blogTag.findMany(queryOptions);

    return NextResponse.json({
      success: true,
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        postCount: (tag as any)._count?.blogPosts || 0,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error fetching blog tags:', error);
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

    const body = await request.json();
    const { name, description, color } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingTag = await prisma.blogTag.findUnique({
      where: { slug }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 }
      );
    }

    // Create tag
    const tag = await prisma.blogTag.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color: color || null
      }
    });

    return NextResponse.json({
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        postCount: 0,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating blog tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 