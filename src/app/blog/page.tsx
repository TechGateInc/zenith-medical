'use client'

import { useState } from 'react'
import Layout from '../../components/Layout/Layout'
import Link from 'next/link'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  authorTitle: string
  publishDate: string
  readTime: string
  category: string
  tags: string[]
  image: string
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('all')

  // Sample blog posts - in a real app, this would come from a CMS or database
  const blogPosts: BlogPost[] = [
    {
      slug: 'understanding-annual-physical-exams',
      title: 'Understanding Annual Physical Exams: What to Expect',
      excerpt: 'Annual physical exams are a cornerstone of preventive healthcare. Learn what tests and screenings are typically included and how to prepare for your visit.',
      content: '', // Full content would be stored here or fetched separately
      author: 'Dr. Sarah Mitchell',
      authorTitle: 'Chief Medical Officer',
      publishDate: '2024-01-15',
      readTime: '5 min read',
      category: 'preventive-care',
      tags: ['physical exam', 'preventive care', 'health screening'],
      image: '/images/blog/annual-physical.jpg'
    },
    {
      slug: 'managing-chronic-conditions-effectively',
      title: 'Managing Chronic Conditions: A Comprehensive Guide',
      excerpt: 'Living with chronic conditions like diabetes, hypertension, or heart disease requires ongoing care and lifestyle management. Our guide provides practical tips for better health outcomes.',
      content: '',
      author: 'Dr. Michael Chen',
      authorTitle: 'Family Physician',
      publishDate: '2024-01-12',
      readTime: '7 min read',
      category: 'chronic-care',
      tags: ['diabetes', 'hypertension', 'chronic disease', 'lifestyle'],
      image: '/images/blog/chronic-conditions.jpg'
    },
    {
      slug: 'mental-health-awareness-breaking-stigma',
      title: 'Mental Health Awareness: Breaking the Stigma',
      excerpt: 'Mental health is just as important as physical health. Learn about common mental health conditions, available treatments, and how to seek help without stigma.',
      content: '',
      author: 'Dr. Emily Rodriguez',
      authorTitle: 'Family Physician',
      publishDate: '2024-01-10',
      readTime: '6 min read',
      category: 'mental-health',
      tags: ['mental health', 'depression', 'anxiety', 'stigma'],
      image: '/images/blog/mental-health.jpg'
    },
    {
      slug: 'flu-season-preparation-vaccination-tips',
      title: 'Flu Season Preparation: Vaccination and Prevention Tips',
      excerpt: 'Protect yourself and your family this flu season. Learn about flu vaccines, prevention strategies, and when to seek medical care for flu symptoms.',
      content: '',
      author: 'Jennifer Thompson',
      authorTitle: 'Nurse Practitioner',
      publishDate: '2024-01-08',
      readTime: '4 min read',
      category: 'preventive-care',
      tags: ['flu vaccine', 'prevention', 'seasonal health'],
      image: '/images/blog/flu-season.jpg'
    },
    {
      slug: 'womens-health-essential-screenings',
      title: "Women&apos;s Health: Essential Screenings by Age",
      excerpt: 'Stay on top of your health with age-appropriate screenings. From mammograms to pap smears, learn what tests women need at different life stages.',
      content: '',
      author: 'Dr. Emily Rodriguez',
      authorTitle: 'Family Physician',
      publishDate: '2024-01-05',
      readTime: '8 min read',
      category: 'womens-health',
      tags: ['womens health', 'screening', 'mammogram', 'preventive care'],
      image: '/images/blog/womens-health.jpg'
    },
    {
      slug: 'pediatric-care-developmental-milestones',
      title: 'Pediatric Care: Understanding Developmental Milestones',
      excerpt: 'Track your child\'s growth and development with our guide to important milestones from infancy through adolescence. Know when to discuss concerns with your pediatrician.',
      content: '',
      author: 'Dr. Michael Chen',
      authorTitle: 'Family Physician',
      publishDate: '2024-01-03',
      readTime: '6 min read',
      category: 'pediatrics',
      tags: ['pediatric care', 'development', 'milestones', 'children'],
      image: '/images/blog/pediatric-care.jpg'
    },
    {
      slug: 'healthy-aging-tips-for-seniors',
      title: 'Healthy Aging: Essential Tips for Seniors',
      excerpt: 'Aging gracefully involves proactive health management. Discover nutrition, exercise, and healthcare tips to maintain independence and quality of life in your golden years.',
      content: '',
      author: 'Dr. Sarah Mitchell',
      authorTitle: 'Chief Medical Officer',
      publishDate: '2024-01-01',
      readTime: '7 min read',
      category: 'senior-care',
      tags: ['senior health', 'aging', 'nutrition', 'exercise'],
      image: '/images/blog/healthy-aging.jpg'
    },
    {
      slug: 'nutrition-guidelines-heart-healthy-diet',
      title: 'Nutrition Guidelines: Building a Heart-Healthy Diet',
      excerpt: 'Cardiovascular disease is preventable through proper nutrition. Learn about heart-healthy foods, meal planning strategies, and dietary changes that can improve your heart health.',
      content: '',
      author: 'Jennifer Thompson',
      authorTitle: 'Nurse Practitioner',
      publishDate: '2023-12-28',
      readTime: '5 min read',
      category: 'nutrition',
      tags: ['nutrition', 'heart health', 'diet', 'cardiovascular'],
      image: '/images/blog/heart-healthy-diet.jpg'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Articles' },
    { id: 'preventive-care', name: 'Preventive Care' },
    { id: 'chronic-care', name: 'Chronic Care' },
    { id: 'mental-health', name: 'Mental Health' },
    { id: 'womens-health', name: "Women&apos;s Health" },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'senior-care', name: 'Senior Care' },
    { id: 'nutrition', name: 'Nutrition' }
  ]

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'preventive-care': 'bg-green-100 text-green-800',
      'chronic-care': 'bg-blue-100 text-blue-800',
      'mental-health': 'bg-purple-100 text-purple-800',
      'womens-health': 'bg-pink-100 text-pink-800',
      'pediatrics': 'bg-yellow-100 text-yellow-800',
      'senior-care': 'bg-indigo-100 text-indigo-800',
      'nutrition': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
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
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Expert</div>
                  <div className="text-slate-600 font-medium">Medical Insights</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Evidence</div>
                  <div className="text-slate-600 font-medium">Based Content</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Latest</div>
                  <div className="text-slate-600 font-medium">Health Updates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Article */}
        {filteredPosts.length > 0 && (
          <section className="mb-16">
            <div className="max-w-6xl mx-auto">
              {/* Section Badge */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                  <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                    Featured Article
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="h-64 md:h-full bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
                    <svg className="h-16 w-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="md:w-2/3 p-8">
                    <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full mr-3">
                        Featured
                    </span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getCategoryColor(filteredPosts[0].category)}`}>
                      {categories.find(cat => cat.id === filteredPosts[0].category)?.name}
                    </span>
                  </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 leading-tight">
                    <Link href={`/blog/${filteredPosts[0].slug}`} className="hover:text-blue-600 transition-colors">
                      {filteredPosts[0].title}
                    </Link>
                  </h2>
                    <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{filteredPosts[0].author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(filteredPosts[0].publishDate)}</span>
                      <span className="mx-2">•</span>
                      <span>{filteredPosts[0].readTime}</span>
                    </div>
                    <Link
                      href={`/blog/${filteredPosts[0].slug}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg"
                    >
                      Read Article
                    </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                  Latest Articles
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">Recent Health Insights</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Discover the latest medical insights and health tips from our healthcare professionals
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(1).map((post) => (
                <article key={post.slug} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
                  <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center mb-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                      {categories.find(cat => cat.id === post.category)?.name}
                    </span>
                  </div>
                  
                    <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  
                    <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div>
                      <span className="font-medium text-slate-700">{post.author}</span>
                      <p className="text-xs">{post.authorTitle}</p>
                    </div>
                    <div className="text-right">
                      <p>{formatDate(post.publishDate)}</p>
                      <p className="text-xs">{post.readTime}</p>
                    </div>
                  </div>
                  
                    <div>
                    <Link
                      href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                    >
                        Read More
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </div>
        </section>

        {/* Load More / Pagination would go here in a real app */}
        {filteredPosts.length === 0 && (
          <section className="text-center py-12">
            <p className="text-lg text-slate-600">No articles found in this category.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View all articles
            </button>
          </section>
        )}

        {/* Health Resources CTA */}
        <section className="mt-20">
          <div className="max-w-6xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Personalized Care
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 lg:p-12">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                    Need Personalized Health Advice?
                  </h2>
                  <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                    Our healthcare professionals are here to provide personalized care and answer your health questions with evidence-based medical expertise.
                  </p>

                  {/* Feature List */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="text-center lg:text-left">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-3">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-slate-800">Expert Consultations</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-3">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-slate-800">Personalized Care Plans</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-3">
                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-slate-800">Immediate Support</div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/contact"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all hover:shadow-lg inline-flex items-center justify-center"
              >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                Schedule Consultation
              </Link>
              <Link
                href="/intake"
                      className="border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 font-semibold py-3 px-8 rounded-xl transition-all inline-flex items-center justify-center"
              >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                Patient Intake Form
              </Link>
                  </div>
                </div>

                {/* Right Visual Element */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div className="text-lg font-semibold mb-2">Comprehensive Healthcare</div>
                        <div className="text-sm opacity-90">Trusted by families for quality medical care</div>
                      </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full"></div>
                    <div className="absolute top-1/2 right-8 w-4 h-4 bg-white/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 