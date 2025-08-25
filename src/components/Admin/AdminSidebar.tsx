/**
 * Modern Admin Sidebar Component
 * Provides sidebar navigation for admin interface
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import { useApiAuth } from '@/lib/auth/use-api-auth';

import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Download,
  Shield,
  HelpCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
  Mail
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavigationItem[];
}

interface AdminSidebarProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const { handleApiError } = useApiAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [intakeCount, setIntakeCount] = useState<number>(0);

  const [loadingCount, setLoadingCount] = useState(true);

  // Fetch all counts
  const fetchCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/intake/count');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `HTTP ${response.status}: Failed to fetch intake count`);
        
        // Handle authentication errors
        if (handleApiError(error, response)) {
          return;
        }
        
        throw error;
      }
      
      const data = await response.json();
      if (data.success) {
        setIntakeCount(data.count);
      }
    } catch (error) {
      // Only log error if it wasn't handled by the API auth hook
      if (!handleApiError(error)) {
        console.error('Error fetching intake count:', error);
      }
    }
    setLoadingCount(false);
  }, [handleApiError]);

  // Fetch counts on component mount
  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Patient Intake',
      href: '/admin/dashboard/intake',
      icon: Users,
      badge: intakeCount > 0 ? intakeCount : undefined,
    },
    {
      name: 'Contact Forms',
      href: '/admin/contact',
      icon: Mail,
    },
    {
      name: 'Content Management',
      href: '/admin/content',
      icon: FileText,
      children: [
        {
          name: 'Team Members',
          href: '/admin/content/team',
          icon: Users,
        },
        {
          name: 'Blog Posts',
          href: '/admin/content/blog',
          icon: BookOpen,
        },
        {
          name: 'FAQ',
          href: '/admin/content/faq',
          icon: HelpCircle,
        },
        {
          name: 'Services',
          href: '/admin/content/services',
          icon: BookOpen,
        },
        {
          name: 'Doctor Profiles',
          href: '/admin/content/doctors',
          icon: Users,
        },
      ],
    },

    // Notifications temporarily removed
    // {
    //   name: 'Notifications',
    //   href: '/admin/notifications',
    //   icon: Bell,
    //   badge: notificationCount > 0 ? notificationCount : undefined,
    // },
    {
      name: 'Export Data',
      href: '/admin/export',
      icon: Download,
    },
    {
      name: 'Security',
      href: '/admin/security',
      icon: Shield,
    },
  ];

  const isCurrentPath = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const hasActiveChild = (children?: NavigationItem[]) => {
    return children?.some(child => isCurrentPath(child.href));
  };

  const renderNavigationItem = (item: NavigationItem, isChild: boolean = false) => {
    const isActive = isCurrentPath(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = hasActiveChild(item.children);

    return (
      <div key={item.name}>
        <Link
          href={item.href}
          className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
            isActive || isParentActive
              ? 'bg-blue-100 text-blue-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } ${isChild ? 'ml-6 py-2' : ''}`}
        >
          <item.icon 
            size={18} 
            className={`${collapsed ? 'mr-0' : 'mr-3'} flex-shrink-0 ${
              isActive || isParentActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
            }`} 
          />
          {!collapsed && (
            <>
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className={`ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ${
                  (item.name === 'Patient Intake' && item.badge > 0) ? 'animate-pulse' : ''
                }`}>
                  {loadingCount && item.name === 'Patient Intake' ? '...' : item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronRight 
                  size={16} 
                  className={`ml-2 transition-transform ${isParentActive ? 'rotate-90' : ''}`}
                />
              )}
            </>
          )}
        </Link>

        {/* Child items */}
        {hasChildren && !collapsed && (isParentActive || isActive) && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavigationItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-4' : 'justify-between px-6'} py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl shadow-sm`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 mr-3 rounded-xl overflow-hidden border-2 border-blue-200 shadow-sm">
              <Image
                src="/images/zenith-medical-logo new 1.png"
                alt="Zenith Medical Centre"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-blue-900 leading-tight mb-1">Admin Panel</h2>
              <p className="text-xs text-blue-700 font-medium tracking-wide">Zenith Medical Centre</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Quick actions */}
        <div className="mb-6">
          <Link
            href="/"
            className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-100 hover:text-gray-900`}
          >
            <Home 
              size={18} 
              className={`${collapsed ? 'mr-0' : 'mr-3'} flex-shrink-0 text-gray-400 group-hover:text-gray-600`} 
            />
            {!collapsed && <span>Back to Website</span>}
          </Link>
        </div>

        {/* Main navigation */}
        <div className="space-y-1">
          {navigation.map(item => renderNavigationItem(item))}
        </div>

        {/* Settings */}
        <div className="pt-6 border-t border-gray-200">
          <Link
            href="/admin/settings"
            className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-100 hover:text-gray-900`}
          >
            <Settings 
              size={18} 
              className={`${collapsed ? 'mr-0' : 'mr-3'} flex-shrink-0 text-gray-400 group-hover:text-gray-600`} 
            />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-white rounded-b-2xl shadow-sm">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow text-white font-bold text-lg">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-blue-900 truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-blue-700 font-medium truncate">{user?.role || 'Administrator'}</p>
            </div>
            <Link
              href="/api/auth/signout"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow text-white font-bold text-lg">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
            </div>
            <Link
              href="/api/auth/signout"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar; 