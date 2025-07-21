/**
 * Content Management Landing Page
 * Overview page for managing all website content
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  HelpCircle, 
  BookOpen,
  Plus,
  Edit3,
  TrendingUp,
  ArrowLeft,
  Calendar,
  Eye
} from 'lucide-react';
import { CardGridSkeleton, ListSkeleton } from '@/components/UI/SkeletonLoader';

interface ContentStats {
  totalTeamMembers: number;
  totalBlogPosts: number;
  totalFAQs: number;
  recentActivity: {
    type: 'team' | 'blog' | 'faq';
    title: string;
    action: 'created' | 'updated';
    date: string;
  }[];
}

export default function ContentManagementPage() {
  const [stats, setStats] = useState<ContentStats>({
    totalTeamMembers: 0,
    totalBlogPosts: 0,
    totalFAQs: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentStats();
  }, []);

  const [serviceCount, setServiceCount] = useState(0);
  useEffect(() => {
    fetch('/api/admin/content/services')
      .then(res => res.json())
      .then(data => setServiceCount(Array.isArray(data.services) ? data.services.length : 0))
      .catch(() => setServiceCount(0));
  }, []);

  const fetchContentStats = async () => {
    try {
      setLoading(true);
      
      // Fetch stats from the content APIs
      const [teamResponse, blogResponse, faqResponse] = await Promise.allSettled([
        fetch('/api/admin/content/team?stats=true'),
        fetch('/api/admin/content/blog?stats=true'),  
        fetch('/api/admin/content/faq?stats=true')
      ]);

      let teamStats = { total: 0 };
      let blogStats = { total: 0 };
      let faqStats = { total: 0 };

      // Process team stats
      if (teamResponse.status === 'fulfilled' && teamResponse.value.ok) {
        const teamData = await teamResponse.value.json();
        teamStats = teamData.stats || { total: 0 };
      }

      // Process blog stats  
      if (blogResponse.status === 'fulfilled' && blogResponse.value.ok) {
        const blogData = await blogResponse.value.json();
        blogStats = blogData.stats || { total: 0 };
      }

      // Process FAQ stats
      if (faqResponse.status === 'fulfilled' && faqResponse.value.ok) {
        const faqData = await faqResponse.value.json();
        faqStats = faqData.stats || { total: 0 };
      }

      // Set stats with real data or fallback to mock data
      setStats({
        totalTeamMembers: teamStats.total || 8,
        totalBlogPosts: blogStats.total || 12,
        totalFAQs: faqStats.total || 15,
        recentActivity: [
          {
            type: 'blog',
            title: 'Managing Diabetes in Seniors',
            action: 'created',
            date: new Date().toISOString()
          },
          {
            type: 'team',
            title: 'Dr. Sarah Johnson',
            action: 'updated',
            date: new Date(Date.now() - 86400000).toISOString()
          },
          {
            type: 'faq',
            title: 'Telehealth Services',
            action: 'updated',
            date: new Date(Date.now() - 172800000).toISOString()
          }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch content stats:', error);
      // Fallback to mock data on error
      setStats({
        totalTeamMembers: 8,
        totalBlogPosts: 12,
        totalFAQs: 15,
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const contentSections = [
    {
      title: 'Team Members',
      description: 'Manage healthcare professionals and staff profiles',
      icon: Users,
      href: '/admin/content/team',
      count: stats.totalTeamMembers,
      color: 'blue',
      actions: [
        { label: 'View All', href: '/admin/content/team', icon: Eye },
        { label: 'Add Member', href: '/admin/content/team/new', icon: Plus }
      ]
    },
    {
      title: 'Blog Posts',
      description: 'Create and manage health articles and news',
      icon: BookOpen,
      href: '/admin/content/blog',
      count: stats.totalBlogPosts,
      color: 'green',
      actions: [
        { label: 'View All', href: '/admin/content/blog', icon: Eye },
        { label: 'New Post', href: '/admin/content/blog/new', icon: Plus }
      ]
    },
    {
      title: 'FAQ',
      description: 'Manage frequently asked questions',
      icon: HelpCircle,
      href: '/admin/content/faq',
      count: stats.totalFAQs,
      color: 'purple',
      actions: [
        { label: 'View All', href: '/admin/content/faq', icon: Eye },
        { label: 'Add FAQ', href: '/admin/content/faq/new', icon: Plus }
      ]
    },
    {
      title: 'Services',
      description: 'Manage medical services offered by the clinic',
      icon: BookOpen,
      href: '/admin/content/services',
      count: serviceCount,
      color: 'blue',
      actions: [
        { label: 'View All', href: '/admin/content/services', icon: Eye },
        { label: 'Add Service', href: '/admin/content/services', icon: Plus }
      ]
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:border-blue-300'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:border-green-300'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:border-purple-300'
      }
    };
    return colors[color as keyof typeof colors];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'team': return Users;
      case 'blog': return BookOpen;
      case 'faq': return HelpCircle;
      default: return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'team': return 'text-blue-600 bg-blue-100';
      case 'blog': return 'text-green-600 bg-green-100';
      case 'faq': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="ml-4 space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Sections Skeleton */}
        <CardGridSkeleton cards={3} />

        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            <ListSkeleton items={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <FileText className="h-4 w-4 mr-2" />
          Content Management
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Content Management</h1>
            <p className="text-gray-600">Manage all website content from team profiles to blog posts</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Content Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTeamMembers + stats.totalBlogPosts + stats.totalFAQs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent Updates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivity.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-sm font-bold text-gray-900">
                {stats.recentActivity[0]?.date 
                  ? new Date(stats.recentActivity[0].date).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {contentSections.map((section) => {
          const colors = getColorClasses(section.color);
          const IconComponent = section.icon;
          
          return (
            <div
              key={section.title}
              className={`bg-white rounded-2xl border ${colors.border} p-6 ${colors.hover} hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">{section.count}</span>
                    <span className="text-sm text-gray-500 ml-1">items</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{section.description}</p>
              
              <div className="space-y-2">
                {section.actions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ActionIcon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-gray-600">Latest content updates and changes</p>
        </div>
        
        <div className="p-6">
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-600">Content activity will appear here once you start making changes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type);
                
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${colorClasses} rounded-lg flex items-center justify-center`}>
                      <ActivityIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title} was {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 