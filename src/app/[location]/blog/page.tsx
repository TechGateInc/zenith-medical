import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getLocationBySlug,
  getBlogPostsForLocation,
} from '@/lib/utils/location-content'

interface LocationBlogPageProps {
  params: Promise<{ location: string }>
}

export async function generateMetadata({ params }: LocationBlogPageProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  if (!location) {
    return { title: 'Location Not Found' }
  }

  return {
    title: `Health Blog | ${location.name}`,
    description: `Health articles, medical tips, and wellness advice from ${location.name}.`,
  }
}

export default async function LocationBlogPage({ params }: LocationBlogPageProps) {
  const { location: locationSlug } = await params
  const location = await getLocationBySlug(locationSlug)

  if (!location) {
    notFound()
  }

  const posts = await getBlogPostsForLocation(locationSlug)
  const publishedPosts = posts.filter(p => p.published)

  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  {location.name}
                </span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight">
                Health & Wellness Blog
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Stay informed with the latest health tips, medical news, and wellness advice from our team at {location.name}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {publishedPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">No Blog Posts Yet</h2>
              <p className="text-slate-600 mb-8">
                Check back soon for health articles and medical tips from our team.
              </p>
              <Link
                href={`/${location.slug}`}
                className="inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: location.primaryColor }}
              >
                Return to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${location.slug}/blog/${post.slug}`}
                  className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Post Image */}
                  <div className="relative h-48 bg-slate-100">
                    {post.excerpt ? (
                      <div
                        className="w-full h-full flex items-center justify-center p-6"
                        style={{ background: `linear-gradient(135deg, ${location.primaryColor}20, ${location.secondaryColor}30)` }}
                      >
                        <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${location.primaryColor}20, ${location.secondaryColor}30)` }}
                      >
                        <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    {post.publishedAt && (
                      <p className="text-sm text-slate-500 mb-2">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-slate-600 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <span
                      className="inline-flex items-center font-semibold transition-colors"
                      style={{ color: location.primaryColor }}
                    >
                      Read More
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
