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

    // Get blog post
    const post = await prisma.blogPost.findUnique({
      where: { id: postId }
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

    return NextResponse.json({ post })

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
    const updateData: any = {}

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

    // Update the post
    const updatedPost = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData
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

    return NextResponse.json({ post: updatedPost })

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
    const allowedDeleteRoles = [AdminRole.SUPER_ADMIN, AdminRole.ADMIN]
    if (!user || !user.role || !allowedDeleteRoles.includes(user.role as any)) {
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