'use client'

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import Link from 'next/link'
import { useAppointmentUrls } from '@/lib/hooks/useSettings'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  publishDate: string
  readTime: string
  category: {
    id: string
    name: string
    slug: string
    color: string
  } | null
  tags: Array<{
    id: string
    name: string
    slug: string
    color: string
  }>
  featured: boolean
  publishedAt: string
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  color: string
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { patientIntakeUrl } = useAppointmentUrls()

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/blog')
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts')
        }
        
        const data = await response.json()
        setBlogPosts(data.posts || [])
        
        // Extract unique categories from posts
        const uniqueCategories = Array.from(
          new Map(
            data.posts
              .filter((post: BlogPost) => post.category)
              .map((post: BlogPost) => [post.category!.id, post.category!])
          ).values()
        ) as BlogCategory[]
        setCategories(uniqueCategories)
        
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError('Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category?.slug === activeCategory)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'No date'
    }
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getCategoryColor = (category: BlogCategory | null) => {
    if (!category) return 'bg-gray-100 text-gray-800'
    
    // Use the category color from database, or fallback to predefined colors
    if (category.color) {
      return category.color
    }
    
    // Fallback colors based on category name
    const colors: Record<string, string> = {
      'preventive-care': 'bg-green-100 text-green-800',
      'chronic-care': 'bg-blue-100 text-blue-800',
      'mental-health': 'bg-purple-100 text-purple-800',
      'womens-health': 'bg-pink-100 text-pink-800',
      'pediatrics': 'bg-yellow-100 text-yellow-800',
      'senior-care': 'bg-indigo-100 text-indigo-800',
      'nutrition': 'bg-orange-100 text-orange-800'
    }
    return colors[category.slug] || 'bg-gray-100 text-gray-800'
  }

  const calculateReadTime = (content: string | null | undefined) => {
    if (!content) {
      return '1 min read'
    }
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readTime} min read`
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Health & Wellness
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight">
                Health & Wellness Blog
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Expert medical insights, health tips, and wellness guidance from our healthcare professionals to help you make informed decisions about your health.
              </p>

              {/* Blog Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">{blogPosts.length}</div>
                  <div className="text-slate-600 font-medium">Expert Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">{categories.length}</div>
                  <div className="text-slate-600 font-medium">Health Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Latest</div>
                  <div className="text-slate-600 font-medium">Medical Insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Articles
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    activeCategory === category.slug
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">No blog posts found</h3>
                <p className="text-slate-600 mb-8">
                  {activeCategory === 'all' 
                    ? 'We\'re working on creating valuable content for you. Check back soon!'
                    : `No posts found in the "${categories.find(c => c.slug === activeCategory)?.name}" category.`
                  }
                </p>
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All Posts
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Featured Badge */}
                    {post.featured && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Post Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-4xl font-bold opacity-20">
                          {post.title.charAt(0)}
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6">
                      {/* Category */}
                      {post.category && (
                        <div className="mb-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}>
                            {post.category.name}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>

                      {/* Excerpt */}
                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {post.excerpt || 'No excerpt available'}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center space-x-4">
                          <span>{post.author || 'Unknown Author'}</span>
                          <span>•</span>
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <span>{calculateReadTime(post.content)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Schedule an appointment with our healthcare professionals and start your journey to better health today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={patientIntakeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                New Patient Intake
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
} 