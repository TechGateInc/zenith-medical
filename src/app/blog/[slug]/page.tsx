import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '../../../lib/prisma'
import Layout from '../../../components/Layout/Layout'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

// Fetch blog post data from database
async function getBlogPost(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug,
        published: true
      },
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
    });

    if (!post) return null;

    // Get author information from the new relationship
    const authorName = post.author?.name || 'Zenith Medical Team';
    const authorTitle = post.author?.title || 'Healthcare Professional';

    return {
      ...post,
      tags: post.tags.map(tag => tag.blogTag),
      author: authorName,
      authorTitle
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Generate comprehensive SEO metadata
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | Zenith Medical Centre',
      description: 'The requested blog post could not be found.',
      robots: { index: false, follow: false }
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zenithmedical.ca';
  const pageUrl = `${baseUrl}/blog/${slug}`;
  const defaultImage = `${baseUrl}/images/zenith-medical-og.jpg`;
  
  // Generate dynamic excerpt if not available
  const description = post.excerpt || 
    (post.content.substring(0, 160).replace(/[#*]/g, '').trim() + '...');
  
  // Combine keywords from category and tags
  const keywords = [
    'Zenith Medical Centre',
    'healthcare',
    'medical advice',
    'health information',
    ...(post.category ? [post.category.name] : []),
    ...post.tags.map(tag => tag.name),
    'family medicine',
    'preventive care'
  ];

  // Calculate reading time
  const wordsPerMinute = 200;
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  const metadata: Metadata = {
    title: `${post.title} | Zenith Medical Centre`,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: post.author }],
    publisher: 'Zenith Medical Centre',
    category: post.category?.name || 'Health & Wellness',
    
    // Robots and indexing
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Canonical URL
    alternates: {
      canonical: pageUrl,
    },
    
    // Open Graph
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: pageUrl,
      title: post.title,
      description,
      siteName: 'Zenith Medical Centre',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      section: post.category?.name || 'Health & Wellness',
      authors: [post.author],
      tags: post.tags.map(tag => tag.name),
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@ZenithMedical',
      creator: '@ZenithMedical',
      title: post.title,
      description,
      images: [defaultImage],
    },
    
    // Additional meta tags
    other: {
      'article:author': post.author,
      'article:published_time': post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      'article:modified_time': post.updatedAt.toISOString(),
      'article:section': post.category?.name || 'Health & Wellness',
      'article:tag': post.tags.map(tag => tag.name).join(','),
      'reading-time': `${readingTime} min read`,
      'word-count': wordCount.toString(),
    },
  };

  return metadata;
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Calculate reading time
  const wordsPerMinute = 200;
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Generate comprehensive structured data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zenithmedical.ca';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${baseUrl}/blog/${slug}#article`,
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 160).replace(/[#*]/g, '').trim(),
    image: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/zenith-medical-og.jpg`,
      width: 1200,
      height: 630
    },
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${baseUrl}/team`
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: 'Zenith Medical Centre',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/zenith-medical-logo new 1.png`,
        width: 200,
        height: 60
      },
      url: baseUrl
    },
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${slug}`
    },
    articleSection: post.category?.name || 'Health & Wellness',
    keywords: [
      ...(post.category ? [post.category.name] : []),
      ...post.tags.map(tag => tag.name)
    ].join(','),
    wordCount,
    timeRequired: `PT${readingTime}M`,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(post.category && {
      about: {
        '@type': 'Thing',
        name: post.category.name
      }
    }),
    ...(post.tags.length > 0 && {
      mentions: post.tags.map(tag => ({
        '@type': 'Thing',
        name: tag.name
      }))
    })
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Health Blog',
        item: `${baseUrl}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${baseUrl}/blog/${slug}`
      }
    ]
  };

  return (
    <Layout>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <article className="bg-white">
        {/* Article Header */}
        <header className="bg-slate-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-8" aria-label="Breadcrumb">
                <Link 
                  href="/blog" 
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium inline-flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Health Blog
                </Link>
              </nav>

              {/* Category Badge */}
              {post.category && (
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6"
                     style={{
                       backgroundColor: post.category.color ? `${post.category.color}20` : '#f0f9ff',
                       color: post.category.color || '#1e40af'
                     }}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {post.category.name}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{post.author}</span>
                    <p className="text-sm text-gray-500">{post.authorTitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()} className="text-sm">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </time>
                </div>
                
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Tags Section */}
              {post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Article Tags
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {post.tags.map((tag) => (
                        <span 
                          key={tag.id} 
                          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}20` : '#ffffff',
                            borderColor: tag.color ? `${tag.color}40` : '#e5e7eb',
                            color: tag.color || '#374151'
                          }}
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Author Bio */}
              <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-gray-200">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                    <span className="text-white font-bold text-xl">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">{post.author}</h4>
                    <p className="text-blue-600 font-semibold mb-3">{post.authorTitle}</p>

                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-12 p-8 bg-blue-600 rounded-2xl text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Take Control of Your Health?</h3>
                <p className="text-blue-100 mb-6 text-lg">
                  Schedule an appointment with our experienced healthcare team today.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Schedule Appointment
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
} 