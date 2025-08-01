'use client'

import React, { useState } from 'react'
import { X, CheckCircle, Circle, Calendar, Target, Zap, Users, TrendingUp, Shield } from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  description?: string
  urgent?: boolean
}

interface ChecklistSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  items: ChecklistItem[]
  color: string
}

interface ViewChecklistProps {
  isOpen: boolean
  onClose: () => void
}

export const ViewChecklist: React.FC<ViewChecklistProps> = ({ isOpen, onClose }) => {
  const [sections] = useState<ChecklistSection[]>([
    {
      id: 'technical',
      title: 'Technical SEO',
      icon: <Zap className="h-5 w-5" />,
      description: 'Core technical optimizations',
      color: 'green',
      items: [
        { id: 'meta', title: 'Meta tags and Open Graph data', completed: true },
        { id: 'schema', title: 'Structured data (Schema.org)', completed: true },
        { id: 'sitemap', title: 'Sitemap generation', completed: true },
        { id: 'robots', title: 'Robots.txt configuration', completed: true },
        { id: 'mobile', title: 'Mobile responsive design', completed: true },
        { id: 'security', title: 'Security headers', completed: true },
        { id: 'analytics', title: 'Google Analytics integration', completed: true },
      ]
    },
    {
      id: 'setup',
      title: 'Google Setup',
      icon: <Target className="h-5 w-5" />,
      description: 'Essential Google services',
      color: 'blue',
      items: [
        { id: 'gsc', title: 'Google Search Console Setup', completed: false, urgent: true },
        { id: 'verify', title: 'Domain ownership verification', completed: false, urgent: true },
        { id: 'sitemap-submit', title: 'Submit sitemap to Google', completed: false },
        { id: 'gmb', title: 'Google My Business profile', completed: false, urgent: true },
        { id: 'business-info', title: 'Complete business information', completed: false },
      ]
    },
    {
      id: 'content',
      title: 'Content & Media',
      icon: <Users className="h-5 w-5" />,
      description: 'Images, copy, and content',
      color: 'purple',
      items: [
        { id: 'og-image', title: 'Open Graph image (1200x630px)', completed: false },
        { id: 'team-photos', title: 'Team photos and bios', completed: false },
        { id: 'testimonials', title: 'Patient testimonials', completed: false },
        { id: 'service-pages', title: 'Service-specific pages', completed: false },
        { id: 'blog-content', title: 'Regular blog posts', completed: false },
      ]
    },
    {
      id: 'local',
      title: 'Local SEO',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Local search optimization',
      color: 'orange',
      items: [
        { id: 'healthgrades', title: 'Healthgrades listing', completed: false },
        { id: 'webmd', title: 'WebMD directory', completed: false },
        { id: 'zocdoc', title: 'Zocdoc profile', completed: false },
        { id: 'yelp', title: 'Yelp business profile', completed: false },
        { id: 'local-schema', title: 'Local business schema markup', completed: false },
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance & Trust',
      icon: <Shield className="h-5 w-5" />,
      description: 'Legal and trust factors',
      color: 'red',
      items: [
        { id: 'privacy', title: 'Privacy policy', completed: true },
        { id: 'terms', title: 'Terms of service', completed: false },
        { id: 'licenses', title: 'Medical licenses display', completed: false },
        { id: 'security-badges', title: 'Security certifications', completed: false },
        { id: 'accessibility', title: 'Accessibility statement', completed: false },
      ]
    }
  ])

  const getTotalProgress = () => {
    const allItems = sections.flatMap(section => section.items)
    const completedItems = allItems.filter(item => item.completed)
    return Math.round((completedItems.length / allItems.length) * 100)
  }

  const getColorClasses = (color: string, completed: boolean = false) => {
    const colors = {
      green: completed ? 'bg-green-500' : 'bg-green-100 text-green-700',
      blue: completed ? 'bg-blue-500' : 'bg-blue-100 text-blue-700',
      purple: completed ? 'bg-purple-500' : 'bg-purple-100 text-purple-700',
      orange: completed ? 'bg-orange-500' : 'bg-orange-100 text-orange-700',
      red: completed ? 'bg-red-500' : 'bg-red-100 text-red-700',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">SEO & Marketing Checklist</h2>
              <p className="text-gray-600">Track your website optimization progress</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress Circle */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${getTotalProgress()}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{getTotalProgress()}%</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.map((section) => {
              const completedCount = section.items.filter(item => item.completed).length
              const progressPercent = Math.round((completedCount / section.items.length) * 100)
              
              return (
                <div key={section.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(section.color)}`}>
                        {section.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{completedCount}/{section.items.length}</div>
                      <div className="text-xs text-gray-500">{progressPercent}% complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getColorClasses(section.color, true)}`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        {item.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {item.title}
                          {item.urgent && !item.completed && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              Urgent
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Timeline Section */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recommended Timeline</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Week 1-2</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Set up Google Search Console</li>
                  <li>• Create Google My Business</li>
                  <li>• Domain verification</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Week 3-4</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create missing content</li>
                  <li>• Submit to directories</li>
                  <li>• Social media setup</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Month 2+</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Content marketing</li>
                  <li>• Performance monitoring</li>
                  <li>• Ongoing optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewChecklist