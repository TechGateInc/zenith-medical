import { NextResponse } from 'next/server'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zenithmedical.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Sample blog posts - in a real app, this would come from a database
  const blogPosts = [
    'understanding-annual-physical-exams',
    'managing-chronic-conditions-effectively',
    'mental-health-awareness-breaking-stigma',
    'flu-season-preparation-vaccination-tips',
    'womens-health-essential-screenings',
    'pediatric-care-developmental-milestones',
    'healthy-aging-tips-for-seniors',
    'nutrition-guidelines-heart-healthy-diet'
  ]

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

  <!-- Blog Listing Page -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <mobile:mobile/>
  </url>

  <!-- Individual Blog Posts -->
  ${blogPosts.map(slug => `
  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
    <mobile:mobile/>
    <news:news>
      <news:publication>
        <news:name>Zenith Medical Centre Health Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2024-01-15</news:publication_date>
      <news:title>${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</news:title>
      <news:keywords>health, medical, healthcare, family medicine</news:keywords>
    </news:news>
  </url>`).join('')}

  <!-- Additional important medical pages would go here -->
  <!-- Patient intake would be excluded as it's private -->

</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  })
} 