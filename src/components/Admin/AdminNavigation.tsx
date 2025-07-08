/**
 * Admin Navigation Component
 * Provides navigation for admin areas
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  Download, 
  Settings,
  Bell,
  Calendar,
  Shield,
  HelpCircle,
  BookOpen,
  ChevronLeft
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current?: boolean;
  children?: NavigationItem[];
}

const AdminNavigation: React.FC = () => {
  const pathname = usePathname();

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
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
      ],
    },
    {
      name: 'Appointments',
      href: '/admin/appointments',
      icon: Calendar,
      children: [
        {
          name: 'Providers',
          href: '/admin/appointments/providers',
          icon: Users,
        },
      ],
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
    },
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

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Navigation */}
          <div className="flex items-center space-x-8">
            {/* Back to main site */}
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              title="Back to main site"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:block ml-1">Back to Site</span>
            </Link>

            {/* Admin Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isCurrentPath(item.href) || hasActiveChild(item.children)
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={16} className="mr-2" />
                    {item.name}
                  </Link>

                  {/* Dropdown for items with children */}
                  {item.children && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`flex items-center px-4 py-2 text-sm transition-colors ${
                              isCurrentPath(child.href)
                                ? 'text-blue-700 bg-blue-50'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <child.icon size={14} className="mr-3" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/notifications"
              className={`p-2 rounded-full transition-colors ${
                isCurrentPath('/admin/notifications')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title="Notifications"
            >
              <Bell size={20} />
            </Link>

            <Link
              href="/api/auth/signout"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md border border-gray-300 hover:border-gray-400 transition-colors text-sm font-medium"
            >
              Sign Out
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {navigation.map((item) => (
              <React.Fragment key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isCurrentPath(item.href) || hasActiveChild(item.children)
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={16} className="mr-2" />
                  {item.name}
                </Link>
                
                {/* Mobile sub-navigation */}
                {item.children && hasActiveChild(item.children) && (
                  <div className="col-span-2 ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                          isCurrentPath(child.href)
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <child.icon size={14} className="mr-2" />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation; 