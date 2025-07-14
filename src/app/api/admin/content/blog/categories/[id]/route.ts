/**
 * Admin Blog Category API - Individual Category Operations
 * Handles individual category CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogPosts: {
              where: { published: true }
            }
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        orderIndex: category.orderIndex,
        published: category.published,
        postCount: category._count.blogPosts,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching blog category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, color, orderIndex, published } = body;

    // Check if category exists
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (name && name !== existingCategory.name) {
      // Generate new slug if name changed
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug conflicts with existing categories
      const conflictCategory = await prisma.blogCategory.findUnique({
        where: { slug }
      });

      if (conflictCategory && conflictCategory.id !== id) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
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

    if (orderIndex !== undefined) {
      updateData.orderIndex = orderIndex;
    }

    if (published !== undefined) {
      updateData.published = published;
    }

    // Update category
    const category = await prisma.blogCategory.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            blogPosts: {
              where: { published: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        orderIndex: category.orderIndex,
        published: category.published,
        postCount: category._count.blogPosts,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating blog category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { blogPosts: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has associated blog posts
    if (existingCategory._count.blogPosts > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with associated blog posts. Please reassign or delete the posts first.' 
        },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.blogCategory.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 