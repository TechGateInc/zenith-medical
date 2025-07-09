/**
 * Admin Blog Tag API - Individual Tag Operations
 * Handles individual tag CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const tag = await prisma.blogTag.findUnique({
      where: { id },
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
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        postCount: tag._count.blogPosts,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching blog tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, color } = body;

    // Check if tag exists
    const existingTag = await prisma.blogTag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (name && name !== existingTag.name) {
      // Generate new slug if name changed
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug conflicts with existing tags
      const conflictTag = await prisma.blogTag.findUnique({
        where: { slug }
      });

      if (conflictTag && conflictTag.id !== id) {
        return NextResponse.json(
          { error: 'A tag with this name already exists' },
          { status: 400 }
        );
      }

      updateData.name = name.trim();
      updateData.slug = slug;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (color !== undefined) {
      updateData.color = color || null;
    }

    // Update tag
    const tag = await prisma.blogTag.update({
      where: { id },
      data: updateData,
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
        postCount: tag._count.blogPosts,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating blog tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if tag exists
    const existingTag = await prisma.blogTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { blogPosts: true }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if tag has associated blog posts
    if (existingTag._count.blogPosts > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete tag with associated blog posts. Please remove the tag from posts first.',
          postCount: existingTag._count.blogPosts
        },
        { status: 400 }
      );
    }

    // Delete tag
    await prisma.blogTag.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 