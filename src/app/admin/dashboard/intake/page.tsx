/**
 * Patient Intake List Page
 * Displays all patient intake submissions with modern UI
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Search, Filter, Calendar, Download, RefreshCw, Eye, Clock, Mail, Phone } from 'lucide-react';

interface IntakeSubmission {
  id: string;
  legalFirstName: string;
  legalLastName: string;
  preferredName?: string;
  emailAddress: string;
  phoneNumber: string;
  status: 'SUBMITTED' | 'REVIEWED' | 'APPOINTMENT_SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  appointmentBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PatientIntakePage() {
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const fetchIntakeSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/intake');
      if (!response.ok) {
        throw new Error('Failed to fetch intake submissions');
      }
      
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      } else {
        throw new Error(data.error || 'Failed to load submissions');
      }
    } catch (err) {
      console.error('Intake submissions fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
      // Clear submissions on error
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = useCallback(() => {
    let filtered = submissions;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(submission => 
        submission.legalFirstName.toLowerCase().includes(search) ||
        submission.legalLastName.toLowerCase().includes(search) ||
        submission.preferredName?.toLowerCase().includes(search) ||
        submission.emailAddress.toLowerCase().includes(search) ||
        submission.phoneNumber.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(submission => 
            new Date(submission.createdAt) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(submission => 
            new Date(submission.createdAt) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(submission => 
            new Date(submission.createdAt) >= filterDate
          );
          break;
      }
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    fetchIntakeSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [filterSubmissions]);

  const getStatusBadge = (status: IntakeSubmission['status']) => {
    const statusConfig = {
      SUBMITTED: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Submitted' },
      REVIEWED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Reviewed' },
      APPOINTMENT_SCHEDULED: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', label: 'Scheduled' },
      CHECKED_IN: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', label: 'Checked In' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Completed' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', label: 'Cancelled' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export submissions');
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
          <Users className="h-4 w-4 mr-2" />
          Patient Intake Management
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Patient Intake</h1>
            <p className="text-gray-600">Manage and review patient intake submissions</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={fetchIntakeSubmissions}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="APPOINTMENT_SCHEDULED">Scheduled</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredSubmissions.length} of {submissions.length} submissions
        </p>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading submissions...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Submissions</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchIntakeSubmissions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'No patient intake submissions have been received yet.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.legalFirstName} {submission.legalLastName}
                        </p>
                        {submission.preferredName && (
                          <p className="text-sm text-gray-500">
                            Preferred: {submission.preferredName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {submission.emailAddress}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {submission.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(submission.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/dashboard/intake/${submission.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-900 font-medium"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 