/**
 * Appointments Management Landing Page
 * Overview page for managing appointment systems and providers
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Settings,
  Plus,
  TrendingUp,
  Eye,
  UserCheck
} from 'lucide-react';

interface AppointmentStats {
  totalProviders: number;
  todayAppointments: number;
  pendingConfirmation: number;
  upcomingWeek: number;
  completedToday: number;
  cancelledToday: number;
}

interface Provider {
  id: string;
  name: string;
  specialization: string;
  status: 'active' | 'inactive';
  todayAppointments: number;
}

export default function AppointmentsPage() {
  const [stats, setStats] = useState<AppointmentStats>({
    totalProviders: 0,
    todayAppointments: 0,
    pendingConfirmation: 0,
    upcomingWeek: 0,
    completedToday: 0,
    cancelledToday: 0
  });
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointmentData();
  }, []);

  const fetchAppointmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from actual API endpoints
      const [statsResponse, providersResponse] = await Promise.allSettled([
        fetch('/api/admin/appointments/stats'),
        fetch('/api/admin/appointments/providers')
      ]);

      // Process stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      } else {
        console.error('Failed to fetch appointment stats:', statsResponse.status === 'rejected' ? statsResponse.reason : 'API call failed');
      }

      // Process providers response
      if (providersResponse.status === 'fulfilled' && providersResponse.value.ok) {
        const providersData = await providersResponse.value.json();
        if (providersData.success) {
          setProviders(providersData.providers);
        }
      } else {
        console.error('Failed to fetch providers:', providersResponse.status === 'rejected' ? providersResponse.reason : 'API call failed');
      }

    } catch (err) {
      console.error('Appointment data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load appointment data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Providers',
      description: 'Add, edit, or configure appointment providers',
      icon: Users,
      href: '/admin/appointments/providers',
      color: 'blue',
      actions: [
        { label: 'View All Providers', href: '/admin/appointments/providers', icon: Eye },
        { label: 'Add Provider', href: '/admin/appointments/providers/new', icon: Plus }
      ]
    },
    {
      title: 'Appointment Settings',
      description: 'Configure booking rules and availability',
      icon: Settings,
      href: '/admin/appointments/settings',
      color: 'green',
      actions: [
        { label: 'Booking Settings', href: '/admin/appointments/settings', icon: Settings },
        { label: 'Time Slots', href: '/admin/appointments/settings/slots', icon: Clock }
      ]
    },
    {
      title: 'Integration Status',
      description: 'Monitor external booking system connections',
      icon: CheckCircle,
      href: '/admin/appointments/integrations',
      color: 'purple',
      actions: [
        { label: 'View Integrations', href: '/admin/appointments/integrations', icon: Eye },
        { label: 'Test Connections', href: '/admin/appointments/integrations/test', icon: CheckCircle }
      ]
    }
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
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        hover: 'hover:border-yellow-300'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200',
        hover: 'hover:border-red-300'
      }
    };
    return colors[color as keyof typeof colors];
  };

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
          <Calendar className="h-4 w-4 mr-2" />
          Appointment Management
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Appointments</h1>
            <p className="text-gray-600">Manage appointment systems, providers, and scheduling</p>
          </div>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-yellow-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Confirmation</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingConfirmation}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming (7 days)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {quickActions.map((action) => {
          const colors = getColorClasses(action.color);
          const IconComponent = action.icon;
          
          return (
            <div
              key={action.title}
              className={`bg-white rounded-2xl border ${colors.border} p-6 ${colors.hover} hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">{action.title}</h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{action.description}</p>
              
              <div className="space-y-2">
                {action.actions.map((subAction) => {
                  const ActionIcon = subAction.icon;
                  return (
                    <Link
                      key={subAction.label}
                      href={subAction.href}
                      className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ActionIcon className="w-4 h-4 mr-2" />
                      {subAction.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Providers */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Providers</h2>
              <p className="text-gray-600">Healthcare providers accepting appointments today</p>
            </div>
            <Link
              href="/admin/appointments/providers"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              View All
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading providers...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Providers</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAppointmentData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Providers</h3>
              <p className="text-gray-600 mb-4">Add healthcare providers to start accepting appointments.</p>
              <Link
                href="/admin/appointments/providers/new"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <div key={provider.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                        <p className="text-xs text-gray-500">{provider.specialization}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      provider.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {provider.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Today's appointments:</span>
                    <span className="font-semibold text-gray-900">{provider.todayAppointments}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 