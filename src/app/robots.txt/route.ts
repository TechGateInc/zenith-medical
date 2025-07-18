import { NextResponse } from 'next/server'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zenithmedical.ca'
  
  const robotsTxt = `# Robots.txt for Zenith Medical Centre
# Healthcare website - ensuring proper indexing while protecting patient privacy

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /intake/
Disallow: /api/
Disallow: /private/
Disallow: /patient-portal/
Disallow: /_next/
Disallow: /*.json$

# Medical-specific guidelines
# Allow health information and educational content
Allow: /blog/
Allow: /services/
Allow: /about/
Allow: /contact/
Allow: /faq/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling of medical content
Crawl-delay: 1

# Special rules for medical search engines
User-agent: Healthbot
Allow: /

User-agent: MedicalBot
Allow: /

# Block known problematic bots
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  })
} 