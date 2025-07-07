'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../../../lib/auth/use-auth'

interface TeamMember {
  id: string
  name: string
  title: string
  specialties?: string
  bio?: string
  email?: string
  phone?: string
  photoUrl?: string
  sortOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export default function TeamManagementPage() {
  const { isLoading, isAuthenticated, isAdmin, user } = useAuth()
  const router = useRouter()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch team members
  useEffect(() => {
    if (isAuthenticated) {
      fetchTeamMembers()
    }
  }, [isAuthenticated])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/content/team', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }

      const data = await response.json()
      setTeamMembers(data.teamMembers)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async (memberId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/content/team/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ published: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update team member status')
      }

      // Refresh the team members list
      fetchTeamMembers()
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update team member status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const updateSortOrder = async (memberId: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/admin/content/team/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ sortOrder: newOrder })
      })

      if (!response.ok) {
        throw new Error('Failed to update team member order')
      }

      // Refresh the team members list
      fetchTeamMembers()
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update team member order: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const deleteTeamMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to delete "${memberName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/content/team/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete team member')
      }

      // Refresh the team members list
      fetchTeamMembers()
      alert('Team member deleted successfully')
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete team member: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const moveTeamMember = (memberId: string, direction: 'up' | 'down') => {
    const currentMember = teamMembers.find(m => m.id === memberId)
    if (!currentMember) return

    const sortedMembers = [...teamMembers].sort((a, b) => a.sortOrder - b.sortOrder)
    const currentIndex = sortedMembers.findIndex(m => m.id === memberId)
    
    if (direction === 'up' && currentIndex > 0) {
      const targetMember = sortedMembers[currentIndex - 1]
      updateSortOrder(memberId, targetMember.sortOrder)
      updateSortOrder(targetMember.id, currentMember.sortOrder)
    } else if (direction === 'down' && currentIndex < sortedMembers.length - 1) {
      const targetMember = sortedMembers[currentIndex + 1]
      updateSortOrder(memberId, targetMember.sortOrder)
      updateSortOrder(targetMember.id, currentMember.sortOrder)
    }
  }

  const filteredTeamMembers = teamMembers
    .filter(member => {
      if (filter === 'published') return member.published
      if (filter === 'draft') return !member.published
      return true
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                <p className="text-gray-600">Manage healthcare team profiles and information</p>
              </div>
            </div>
            <Link
              href="/admin/content/team/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Team Member
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900">Filter Team Members</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Members ({teamMembers.length})</option>
                <option value="published">Published ({teamMembers.filter(m => m.published).length})</option>
                <option value="draft">Drafts ({teamMembers.filter(m => !m.published).length})</option>
              </select>
            </div>
            <button
              onClick={fetchTeamMembers}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Team Members Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading team members...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-800 font-medium">Error loading team members</p>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchTeamMembers}
              className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredTeamMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No team members found</p>
            <p className="text-gray-400">
              {filter === 'all' ? 'Add your first team member to get started.' : `No ${filter} team members found.`}
            </p>
            <Link
              href="/admin/content/team/new"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add First Team Member
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeamMembers.map((member, index) => (
              <div key={member.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Photo */}
                <div className="relative h-48 bg-gray-100">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Order Controls */}
                  <div className="absolute top-2 right-2 flex flex-col space-y-1">
                    <button
                      onClick={() => moveTeamMember(member.id, 'up')}
                      disabled={index === 0}
                      className="p-1 bg-white bg-opacity-90 rounded shadow text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveTeamMember(member.id, 'down')}
                      disabled={index === filteredTeamMembers.length - 1}
                      className="p-1 bg-white bg-opacity-90 rounded shadow text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 font-medium">{member.title}</p>
                    {member.specialties && (
                      <p className="text-sm text-gray-500 mt-1">{member.specialties}</p>
                    )}
                  </div>

                  {member.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                  )}

                  {(member.email || member.phone) && (
                    <div className="text-sm text-gray-500 mb-4 space-y-1">
                      {member.email && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {member.phone}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/admin/content/team/${member.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublished(member.id, member.published)}
                        className={`text-sm font-medium ${
                          member.published 
                            ? 'text-orange-600 hover:text-orange-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {member.published ? 'Unpublish' : 'Publish'}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => deleteTeamMember(member.id, member.name)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Order: {member.sortOrder}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 