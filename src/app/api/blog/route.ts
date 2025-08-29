import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const featured = searchParams.get('featured') === 'true'

    // Get published blog posts with categories, authors, and tags
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        ...(featured && { featured: true })
      },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(limit, 50), // Limit to max 50 posts
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured: true,
        publishedAt: true,
        metaTitle: true,
        metaDescription: true,
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
            photoUrl: true
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

    // Transform posts to include author information
    const postsWithAuthors = posts.map((post) => {
      const authorName = post.author?.name || 'Zenith Medical Team'
      const authorTitle = post.author?.title || 'Healthcare Professional'

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featured: post.featured,
        publishedAt: post.publishedAt,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        category: post.category,
        tags: post.tags.map(tag => tag.blogTag),
        author: authorName,
        authorTitle: authorTitle
      }
    })

    return NextResponse.json({ 
      posts: postsWithAuthors,
      total: postsWithAuthors.length 
    })

  } catch (error) {
    console.error('Public blog posts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
} 