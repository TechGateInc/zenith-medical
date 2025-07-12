/**
 * Security Management Page
 * Monitor security events, audit logs, and compliance status
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Download,
  RefreshCw,
  ArrowLeft,
  UserX,
  Key,
  Globe,
  Database,
  FileText,
} from 'lucide-react';
import { SecuritySkeleton } from '@/components/UI/SkeletonLoader';

interface SecurityStats {
  totalLogins: number;
  failedAttempts: number;
  activeUsers: number;
  lastSecurityScan: string;
  complianceScore: number;
  securityAlerts: number;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'admin_action' | 'data_access' | 'security_alert';
  user: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
}

interface ComplianceItem {
  id: string;
  category: string;
  description: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  lastChecked: string;
}

export default function SecurityPage() {
  const [stats, setStats] = useState<SecurityStats>({
    totalLogins: 0,
    failedAttempts: 0,
    activeUsers: 0,
    lastSecurityScan: '',
    complianceScore: 0,
    securityAlerts: 0
  });
  
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'compliance'>('overview');

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from actual API endpoints
      const [statsResponse, eventsResponse, complianceResponse] = await Promise.allSettled([
        fetch('/api/admin/security/stats'),
        fetch('/api/admin/security/events'),
        fetch('/api/admin/security/compliance')
      ]);

      // Process stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      // Process events response
      if (eventsResponse.status === 'fulfilled' && eventsResponse.value.ok) {
        const eventsData = await eventsResponse.value.json();
        if (eventsData.success) {
          setEvents(eventsData.events);
        }
      }

      // Process compliance response
      if (complianceResponse.status === 'fulfilled' && complianceResponse.value.ok) {
        const complianceData = await complianceResponse.value.json();
        if (complianceData.success) {
          setCompliance(complianceData.compliance);
        }
      }

      // If any API calls failed, log the errors but don't fail the entire fetch
      if (statsResponse.status === 'rejected') {
        console.error('Failed to fetch security stats:', statsResponse.reason);
      }
      if (eventsResponse.status === 'rejected') {
        console.error('Failed to fetch security events:', eventsResponse.reason);
      }
      if (complianceResponse.status === 'rejected') {
        console.error('Failed to fetch compliance data:', complianceResponse.reason);
      }

    } catch (err) {
      console.error('Security data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: SecurityEvent['severity']) => {
    const severityConfig = {
      low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    };

    const config = severityConfig[severity];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getComplianceStatus = (status: ComplianceItem['status']) => {
    const statusConfig = {
      compliant: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Compliant' },
      warning: { icon: AlertTriangle, bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Warning' },
      non_compliant: { icon: AlertTriangle, bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Non-Compliant' }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login': return CheckCircle;
      case 'failed_login': return UserX;
      case 'admin_action': return Key;
      case 'data_access': return Database;
      case 'security_alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const handleExportLogs = () => {
    // TODO: Implement export functionality
    console.log('Export security logs');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'events', label: 'Security Events', icon: Activity },
    { id: 'compliance', label: 'Compliance', icon: FileText }
  ];

  if (loading) {
    return <SecuritySkeleton />
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
        
        <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Shield className="h-4 w-4 mr-2" />
          Security Management
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Security Center</h1>
            <p className="text-gray-600">Monitor security events, compliance status, and audit logs</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={handleExportLogs}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </button>
            <button
              onClick={fetchSecurityData}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <SecuritySkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Security Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchSecurityData}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Security Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Globe className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Total Logins (24h)</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalLogins}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <UserX className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Failed Attempts</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.failedAttempts}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Active Users</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Compliance Score</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.complianceScore}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Control</h3>
                      <p className="text-gray-600 mb-4">Manage user permissions and authentication settings</p>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Manage Users →
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection</h3>
                      <p className="text-gray-600 mb-4">Review encryption status and backup security</p>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        View Status →
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Scan</h3>
                      <p className="text-gray-600 mb-4">Run comprehensive security analysis</p>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Start Scan →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Security Events</h3>
                    <span className="text-sm text-gray-500">Last 24 hours</span>
                  </div>

                  <div className="space-y-4">
                    {events.map((event) => {
                      const EventIcon = getEventIcon(event.type);
                      return (
                        <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <EventIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <p className="text-sm font-medium text-gray-900">{event.description}</p>
                              {getSeverityBadge(event.severity)}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>User: {event.user}</span>
                              {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                              <span>
                                {new Date(event.timestamp).toLocaleDateString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Compliance Tab */}
              {activeTab === 'compliance' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
                    <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-4">
                    {compliance.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{item.category}</h4>
                            {getComplianceStatus(item.status)}
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last checked: {new Date(item.lastChecked).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 