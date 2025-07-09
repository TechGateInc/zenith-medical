'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BlogCategory {
  id: string
  name: string
  slug: string
  color?: string
}

interface BlogTag {
  id: string
  name: string
  slug: string
  color?: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured: boolean
  published: boolean
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
  category?: BlogCategory
  tags: BlogTag[]
  createdAt: string
  updatedAt: string
}

interface BlogPostFormProps {
  mode: 'create' | 'edit'
  initialData?: BlogPost
}

export default function BlogPostForm({ mode, initialData }: BlogPostFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured: false,
    published: false,
    metaTitle: '',
    metaDescription: '',
    categoryId: '',
    tagIds: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingTags, setLoadingTags] = useState(true)

  // Fetch categories and tags
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/admin/content/blog/categories?published=true', { credentials: 'include' }),
          fetch('/api/admin/content/blog/tags', { credentials: 'include' })
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData.tags || []);
        }
      } catch (error) {
        console.error('Error fetching categories and tags:', error);
      } finally {
        setLoadingCategories(false);
        setLoadingTags(false);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title,
        slug: initialData.slug,
        content: initialData.content,
        excerpt: initialData.excerpt || '',
        featured: initialData.featured,
        published: initialData.published,
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
        categoryId: initialData.category?.id || '',
        tagIds: initialData.tags?.map(tag => tag.id) || []
      })
    }
  }, [mode, initialData])

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug when title changes (only for new posts or if slug matches old title slug)
    if (field === 'title' && (mode === 'create' || (initialData && formData.slug === generateSlug(initialData.title)))) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      setErrors({ title: 'Title and content are required' })
      return
    }

    setLoading(true)

    try {
      const url = mode === 'create' 
        ? '/api/admin/content/blog'
        : `/api/admin/content/blog/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || null,
          tagIds: formData.tagIds,
          publishedAt: formData.published ? new Date().toISOString() : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save blog post')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save blog post')
      }
      
      // Redirect to blog management page
      router.push('/admin/content/blog')
    } catch (err) {
      console.error('Submit error:', err)
      setErrors({ message: err instanceof Error ? err.message : 'Failed to save blog post' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin/content/blog"
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog Posts
          </Link>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="text-gray-500 hover:text-gray-700"
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            {mode === 'edit' && initialData && (
              <Link
                href={`/blog/${initialData.slug}`}
                target="_blank"
                className="text-blue-600 hover:text-blue-800"
              >
                View Live
              </Link>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter blog post title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    /blog/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="url-friendly-slug"
                  />
                </div>
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                {previewMode ? (
                  <div className="border border-gray-300 rounded-lg p-4 min-h-96 bg-gray-50">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br />') }}
                    />
                  </div>
                ) : (
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={20}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.content ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Write your blog post content here. You can use HTML tags for formatting."
                  />
                )}
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  You can use HTML tags for formatting. Line breaks will be preserved.
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.excerpt ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Brief summary of the blog post (optional)"
                />
                {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.excerpt.length}/300 characters
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Publish Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => handleInputChange('published', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                      Published
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                      Featured Post
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.metaTitle ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="SEO title (optional)"
                    />
                    {errors.metaTitle && <p className="mt-1 text-xs text-red-600">{errors.metaTitle}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.metaDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="SEO description (optional)"
                    />
                    {errors.metaDescription && <p className="mt-1 text-xs text-red-600">{errors.metaDescription}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.metaDescription.length}/160 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories & Tags</h3>
                
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    {loadingCategories ? (
                      <div className="text-sm text-gray-500">Loading categories...</div>
                    ) : (
                      <select
                        id="category"
                        value={formData.categoryId}
                        onChange={(e) => handleInputChange('categoryId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Tag Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    {loadingTags ? (
                      <div className="text-sm text-gray-500">Loading tags...</div>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {tags.map((tag) => (
                          <div key={tag.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`tag-${tag.id}`}
                              checked={formData.tagIds.includes(tag.id)}
                              onChange={(e) => {
                                const newTagIds = e.target.checked
                                  ? [...formData.tagIds, tag.id]
                                  : formData.tagIds.filter(id => id !== tag.id);
                                handleInputChange('tagIds', newTagIds);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`tag-${tag.id}`} className="ml-2 text-sm text-gray-700 flex-1">
                              {tag.name}
                              {tag.color && (
                                <span 
                                  className="inline-block w-3 h-3 rounded-full ml-2"
                                  style={{ backgroundColor: tag.color }}
                                />
                              )}
                            </label>
                          </div>
                        ))}
                        {tags.length === 0 && (
                          <p className="text-sm text-gray-500">No tags available</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Tags Display */}
                  {formData.tagIds.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Tags ({formData.tagIds.length})
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {formData.tagIds.map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tagId}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              style={tag.color ? { 
                                backgroundColor: tag.color + '20', 
                                color: tag.color,
                                borderColor: tag.color + '40'
                              } : {}}
                            >
                              {tag.name}
                              <button
                                type="button"
                                onClick={() => {
                                  const newTagIds = formData.tagIds.filter(id => id !== tagId);
                                  handleInputChange('tagIds', newTagIds);
                                }}
                                className="ml-1 h-3 w-3 rounded-full inline-flex items-center justify-center hover:bg-current hover:bg-opacity-20"
                              >
                                <span className="sr-only">Remove {tag.name}</span>
                                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                                </svg>
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
                </button>

                {mode === 'create' && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e)}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Publishing...' : 'Create & Publish'}
                  </button>
                )}

                <Link
                  href="/admin/content/blog"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors text-center block"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 