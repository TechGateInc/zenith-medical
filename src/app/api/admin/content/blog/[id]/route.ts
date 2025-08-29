import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth/config'
import { prisma } from '../../../../../../lib/prisma'
import { auditLog } from '../../../../../../lib/audit/audit-logger'
import { AdminRole } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role as AdminRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: postId } = await params

    // Get blog post with categories, author, and tags
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            title: true,
            bio: true,
            photoUrl: true,
            email: true,
            phone: true
          }
        },
        tags: {
          select: {
            blogTag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Log access
    await auditLog({
      action: 'BLOG_POST_VIEW',
      userId: user.id,
      userEmail: user.email,
      details: { 
        postId: post.id,
        title: post.title,
        slug: post.slug
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Transform response to flatten tag structure
    const transformedPost = {
      ...post,
      tags: post.tags.map(tag => tag.blogTag)
    };

    return NextResponse.json({ post: transformedPost })

  } catch (error) {
    console.error('Blog post fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role as AdminRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: postId } = await params

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { id: true, slug: true, published: true, createdBy: true }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const updateData: Record<string, string | boolean | Date | null | undefined> = {}

    // Handle slug updates with validation
    if (body.slug && body.slug !== existingPost.slug) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugPattern.test(body.slug)) {
        return NextResponse.json(
          { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
          { status: 400 }
        )
      }

      // Check if new slug already exists
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: body.slug },
        select: { id: true }
      })

      if (slugExists && slugExists.id !== postId) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        )
      }

      updateData.slug = body.slug
    }

    // Handle other fields
    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null
    if (body.authorId !== undefined) updateData.authorId = body.authorId || null

    // Handle published status
    if (body.published !== undefined) {
      updateData.published = body.published
      if (body.published && !existingPost.published) {
        // Publishing for the first time
        updateData.publishedAt = new Date()
      } else if (!body.published) {
        // Unpublishing
        updateData.publishedAt = null
      }
    }

    // Handle explicit publishedAt
    if (body.publishedAt !== undefined) {
      updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null
    }

    // Handle tag updates separately
    if (body.tagIds !== undefined) {
      // Remove existing tags
      await prisma.blogPostTag.deleteMany({
        where: { blogPostId: postId }
      });

      // Add new tags if provided
      if (body.tagIds && body.tagIds.length > 0) {
        await prisma.blogPostTag.createMany({
          data: body.tagIds.map((tagId: string) => ({
            blogPostId: postId,
            blogTagId: tagId
          }))
        });
      }
    }

    // Update the post
    const updatedPost = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            title: true,
            bio: true,
            photoUrl: true,
            email: true,
            phone: true
          }
        },
        tags: {
          select: {
            blogTag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        }
      }
    })

    // Log update
    await auditLog({
      action: 'BLOG_POST_UPDATE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        postId: updatedPost.id,
        title: updatedPost.title,
        slug: updatedPost.slug,
        changedFields: Object.keys(updateData),
        published: updatedPost.published,
        featured: updatedPost.featured
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Transform response to flatten tag structure
    const transformedPost = {
      ...updatedPost,
      tags: updatedPost.tags.map(tag => tag.blogTag)
    };

    return NextResponse.json({ 
      success: true,
      post: transformedPost 
    })

  } catch (error) {
    console.error('Blog post update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })

    // Only admins and super admins can delete posts
    const allowedDeleteRoles: AdminRole[] = [AdminRole.SUPER_ADMIN, AdminRole.ADMIN]
    if (!user || !user.role || !allowedDeleteRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: postId } = await params

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { id: true, title: true, slug: true }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Delete the post
    await prisma.blogPost.delete({
      where: { id: postId }
    })

    // Log deletion
    await auditLog({
      action: 'BLOG_POST_DELETE',
      userId: user.id,
      userEmail: user.email,
      details: { 
        postId: existingPost.id,
        title: existingPost.title,
        slug: existingPost.slug
      },
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ message: 'Blog post deleted successfully' })

  } catch (error) {
    console.error('Blog post deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 