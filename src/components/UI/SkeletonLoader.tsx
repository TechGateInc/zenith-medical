/**
 * Skeleton Loader Component
 * Provides skeleton loading states for different admin page types
 */

'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

// Basic skeleton element
const Skeleton: React.FC<SkeletonProps> = ({ className = '', children }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
    {children}
  </div>
);

// Dashboard skeleton components
export const DashboardSkeleton: React.FC = () => (
  <div className="p-6 lg:p-8 space-y-6">
    {/* Header */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      ))}
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Table skeleton components
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 6 
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    {/* Table Header */}
    <div className="border-b border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
      <div className="grid grid-cols-12 gap-1 gap-x-3 sm:gap-x-4">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="col-span-2">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="px-4 sm:px-6 py-5 min-h-[100px]">
          <div className="grid grid-cols-12 gap-1 gap-x-3 sm:gap-x-4">
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="col-span-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Form skeleton components
export const FormSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    {/* Form Header */}
    <div className="border-b border-gray-200 pb-4 mb-6">
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>

    {/* Form Fields */}
    <div className="space-y-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}

      {/* Textarea */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Checkbox */}
      <div className="flex items-center space-x-3">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  </div>
);

// Card grid skeleton
export const CardGridSkeleton: React.FC<{ cards?: number }> = ({ cards = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: cards }, (_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between items-center pt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// List skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 8 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="divide-y divide-gray-200">
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Settings page skeleton
export const SettingsSkeleton: React.FC = () => (
  <div className="p-6 lg:p-8 space-y-6">
    {/* Header */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
    </div>

    {/* Settings Sections */}
    <div className="space-y-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Export page skeleton
export const ExportSkeleton: React.FC = () => (
  <div className="p-6 lg:p-8 space-y-6">
    {/* Header */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Export Options */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Notifications page skeleton
export const NotificationsSkeleton: React.FC = () => (
  <div className="p-6 lg:p-8 space-y-6">
    {/* Header */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
    </div>

    {/* Notification Templates */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Security page skeleton
export const SecuritySkeleton: React.FC = () => (
  <div className="p-6 lg:p-8 space-y-6">
    {/* Header */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-80" />
    </div>

    {/* Security Sections */}
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Appointments page skeleton
export const AppointmentsSkeleton: React.FC = () => (
  <div className="p-6 lg:p-8 space-y-6">
    {/* Header */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
    </div>

    {/* Filters */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
    </div>

    {/* Appointments Table */}
    <TableSkeleton rows={8} columns={7} />
  </div>
);

export default Skeleton; 