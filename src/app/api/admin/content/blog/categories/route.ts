/**
 * Admin Blog Categories API
 * Manages blog categories for content organization
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
    const published = searchParams.get('published');
    const stats = searchParams.get('stats');

    // Build where clause
    const where: any = {};
    if (published === 'true') {
      where.published = true;
    } else if (published === 'false') {
      where.published = false;
    }

    if (stats === 'true') {
      // Return statistics
      const totalCategories = await prisma.blogCategory.count();
      const publishedCategories = await prisma.blogCategory.count({
        where: { published: true }
      });

      return NextResponse.json({
        success: true,
        stats: {
          total: totalCategories,
          published: publishedCategories,
          draft: totalCategories - publishedCategories
        }
      });
    }

    // Fetch categories with blog post counts
    const categories = await prisma.blogCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            blogPosts: {
              where: { published: true }
            }
          }
        }
      },
      orderBy: [
        { orderIndex: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      categories: categories.map(category => ({
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
      }))
    });

  } catch (error) {
    console.error('Error fetching blog categories:', error);
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
    const { name, description, color, orderIndex, published } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    // Create category
    const category = await prisma.blogCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color: color || null,
        orderIndex: orderIndex || 0,
        published: published !== false
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
        postCount: 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 