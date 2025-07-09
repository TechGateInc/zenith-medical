import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zenithmedical.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  try {
    // Fetch published blog posts from database
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        title: true,
        publishedAt: true,
        updatedAt: true,
        category: {
          select: {
            name: true
          }
        },
        tags: {
          select: {
            blogTag: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage - Highest Priority -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <mobile:mobile/>
  </url>

  <!-- About Page - High Priority -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <mobile:mobile/>
  </url>

  <!-- Services Page - High Priority -->
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <mobile:mobile/>
  </url>

  <!-- Contact Page - High Priority -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>

  <!-- FAQ Page - High Priority for Medical Sites -->
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>

  <!-- Patient Intake Page -->
  <url>
    <loc>${baseUrl}/intake</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <mobile:mobile/>
  </url>

  <!-- Blog Listing Page -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <mobile:mobile/>
  </url>

  <!-- Individual Blog Posts -->
  ${blogPosts.map(post => {
    const publishedDate = post.publishedAt ? post.publishedAt.toISOString().split('T')[0] : post.updatedAt.toISOString().split('T')[0];
    const lastModified = post.updatedAt.toISOString().split('T')[0];
    
    // Create keywords from category and tags
    const keywords = [
      'health',
      'medical',
      'healthcare',
      'family medicine',
      'Zenith Medical Centre',
      ...(post.category ? [post.category.name] : []),
      ...post.tags.map(tag => tag.blogTag.name)
    ].join(', ');

    // Check if published within last 2 days for news consideration
    const isRecentNews = post.publishedAt && 
      (new Date().getTime() - new Date(post.publishedAt).getTime()) < (2 * 24 * 60 * 60 * 1000);

    return `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
    <mobile:mobile/>
    ${isRecentNews ? `<news:news>
      <news:publication>
        <news:name>Zenith Medical Centre Health Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publishedDate}</news:publication_date>
      <news:title>${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}</news:title>
      <news:keywords>${keywords}</news:keywords>
    </news:news>` : ''}
  </url>`;
  }).join('')}

  <!-- Additional Medical Pages -->
  <!-- Patient intake success page is excluded as it's a result page -->
  <!-- Admin pages are excluded as they're private -->

</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200', // Cache for 24 hours, serve stale for 12 hours while revalidating
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback sitemap with static pages only
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.7</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Shorter cache for fallback
      },
    });
  }
} 