/**
 * Team Manager Component
 * Admin interface for managing team members with CRUD operations
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  GripVertical,
  User,
  Mail,
  Phone,
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import ImageUpload from './ImageUpload';

// Types
interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  specialties: string[];
  orderIndex: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamMemberFormData {
  name: string;
  title: string;
  bio?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  specialties: string[];
  published: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: TeamMember[] | TeamMember;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

const TeamManager: React.FC = () => {
  // State management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: '',
    title: '',
    bio: '',
    photoUrl: '',
    email: '',
    phone: '',
    specialties: [],
    published: true
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState('orderIndex');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (filterPublished !== null) {
        params.append('published', filterPublished.toString());
      }

      const response = await fetch(`/api/admin/content/team?${params}`);
      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        const teamMembersData = Array.isArray(result.data) ? result.data : [result.data];
        setTeamMembers(teamMembersData);
        setTotalItems(result.pagination?.total || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch team members');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterPublished, sortBy, sortDirection, currentPage, itemsPerPage]);

  // Initial load
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const url = editingMember 
        ? `/api/admin/content/team/${editingMember.id}`
        : '/api/admin/content/team';
      
      const method = editingMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setSuccess(editingMember ? 'Team member updated successfully' : 'Team member created successfully');
        setShowForm(false);
        setEditingMember(null);
        resetForm();
        await fetchTeamMembers();
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/admin/content/team/${id}`, {
        method: 'DELETE'
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setSuccess('Team member deleted successfully');
        await fetchTeamMembers();
      } else {
        throw new Error(result.error || 'Failed to delete team member');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team member');
    }
  };

  // Handle edit
  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      bio: member.bio || '',
      photoUrl: member.photoUrl || '',
      email: member.email || '',
      phone: member.phone || '',
      specialties: member.specialties || [],
      published: member.published
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      bio: '',
      photoUrl: '',
      email: '',
      phone: '',
      specialties: [],
      published: true
    });
    setEditingMember(null);
  };

  // Handle image upload success
  const handleImageUpload = (uploadResult: { secure_url: string }) => {
    setFormData(prev => ({
      ...prev,
      photoUrl: uploadResult.secure_url
    }));
  };

  // Handle specialties input
  const handleSpecialtiesChange = (value: string) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => ({
      ...prev,
      specialties
    }));
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    setIsReordering(true);
    
    try {
      const draggedIndex = teamMembers.findIndex(m => m.id === draggedItem);
      const targetIndex = teamMembers.findIndex(m => m.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      // Create new order
      const newOrder = [...teamMembers];
      const [draggedMember] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedMember);

      // Update order indices
      const updates = newOrder.map((member, index) => ({
        id: member.id,
        orderIndex: index
      }));

      const response = await fetch('/api/admin/content/team', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates })
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setSuccess('Team member order updated successfully');
        await fetchTeamMembers();
      } else {
        throw new Error(result.error || 'Failed to update order');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setDraggedItem(null);
      setIsReordering(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">Manage your medical center team</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Team Member
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Published Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterPublished === null ? '' : filterPublished.toString()}
              onChange={(e) => setFilterPublished(e.target.value === '' ? null : e.target.value === 'true')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="orderIndex">Order</option>
              <option value="name">Name</option>
              <option value="title">Title</option>
              <option value="createdAt">Created</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
          <button onClick={clearMessages} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle size={16} />
            {success}
          </div>
          <button onClick={clearMessages} className="text-green-500 hover:text-green-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <>
            {/* Table Header */}
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-12 gap-1 gap-x-3 sm:gap-x-4 text-sm font-medium text-gray-700">
                <div className="col-span-1 hidden md:flex items-center justify-center w-8 min-w-[2rem] max-w-[2rem]"></div> {/* Drag handle */}
                <div className="col-span-6 md:col-span-3 flex items-center">Photo & Name</div>
                <div className="col-span-6 md:col-span-2 hidden lg:flex items-center">Title</div>
                <div className="col-span-6 md:col-span-2 hidden xl:flex items-center">Contact</div>
                <div className="col-span-6 md:col-span-2 hidden xl:flex items-center">Specialties</div>
                <div className="col-span-6 md:col-span-1 hidden lg:flex items-center justify-center">Status</div>
                <div className="col-span-6 md:col-span-1 flex items-center justify-end w-20 min-w-[5rem] max-w-[5rem]">Actions</div>
              </div>
            </div>

            {/* Skeleton Rows */}
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-1 gap-x-3 sm:gap-x-4 px-4 sm:px-6 py-5 min-h-[100px] items-stretch animate-pulse"
                >
                  {/* Drag Handle Skeleton */}
                  <div className="col-span-1 hidden md:flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>

                  {/* Photo & Name Skeleton */}
                  <div className="col-span-6 md:col-span-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>

                  {/* Title Skeleton */}
                  <div className="col-span-6 md:col-span-2 hidden lg:flex items-start">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>

                  {/* Contact Skeleton */}
                  <div className="col-span-6 md:col-span-2 hidden xl:flex items-start">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>

                  {/* Specialties Skeleton */}
                  <div className="col-span-6 md:col-span-2 hidden xl:flex items-start">
                    <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-14"></div>
                    </div>
                  </div>

                  {/* Status Skeleton */}
                  <div className="col-span-6 md:col-span-1 hidden lg:flex items-start justify-center">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>

                  {/* Actions Skeleton */}
                  <div className="col-span-6 md:col-span-1 flex items-start justify-end gap-1.5 w-20 min-w-[5rem] max-w-[5rem]">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : teamMembers.length === 0 ? (
          <div className="p-8 text-center">
            <User className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No team members match your search criteria.' : 'Get started by adding your first team member.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Team Member
            </button>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-12 gap-1 gap-x-3 sm:gap-x-4 text-sm font-medium text-gray-700">
                <div className="col-span-1 hidden md:flex items-center justify-center w-8 min-w-[2rem] max-w-[2rem]"></div> {/* Drag handle */}
                <div className="col-span-6 md:col-span-3 flex items-center">Photo & Name</div>
                <div className="col-span-6 md:col-span-2 hidden lg:flex items-center">Title</div>
                <div className="col-span-6 md:col-span-2 hidden xl:flex items-center">Contact</div>
                <div className="col-span-6 md:col-span-2 hidden xl:flex items-center">Specialties</div>
                <div className="col-span-6 md:col-span-1 hidden lg:flex items-center justify-center">Status</div>
                <div className="col-span-6 md:col-span-1 flex items-center justify-end w-20 min-w-[5rem] max-w-[5rem]">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, member.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, member.id)}
                  className={`grid grid-cols-12 gap-1 gap-x-3 sm:gap-x-4 px-4 sm:px-6 py-5 hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 transition-all duration-200 min-h-[100px] items-stretch cursor-pointer group ${
                    draggedItem === member.id ? 'opacity-50 scale-95' : ''
                  } ${isReordering ? 'pointer-events-none' : ''}`}
                >
                  {/* Drag Handle */}
                  <div className="col-span-1 hidden md:flex items-center justify-center w-8 min-w-[2rem] max-w-[2rem] pr-0">
                    <GripVertical className="text-gray-400 cursor-move hover:text-blue-600 transition-colors group-hover:text-blue-500" size={16} />
                  </div>

                  {/* Photo & Name */}
                  <div className="col-span-6 md:col-span-3 flex items-start gap-3 pl-0">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:bg-gray-300 transition-all duration-200">
                        <User className="text-gray-500 group-hover:text-gray-700 transition-colors" size={20} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="font-medium text-gray-900 truncate leading-tight group-hover:text-blue-900 transition-colors">{member.name}</div>
                      <div className="text-sm text-gray-500 hidden md:block leading-tight group-hover:text-gray-700 transition-colors">#{member.orderIndex}</div>
                      <div className="text-sm text-gray-500 md:hidden leading-tight">
                        {member.title && <span className="text-gray-600 break-words group-hover:text-gray-800 transition-colors">{member.title}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="col-span-6 md:col-span-2 hidden lg:flex items-start">
                    <div className="text-sm text-gray-900 break-words leading-relaxed max-w-full overflow-hidden group-hover:text-gray-800 transition-colors">
                      {member.title}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="col-span-6 md:col-span-2 hidden xl:flex items-start">
                    <div className="text-sm space-y-2.5 min-w-0 flex-1">
                      {member.email && (
                        <div className="flex items-start gap-2 text-gray-600 group-hover:text-gray-800 transition-colors">
                          <Mail size={12} className="flex-shrink-0 text-gray-400 mt-0.5 group-hover:text-blue-500 transition-colors" />
                          <span className="truncate leading-tight break-all">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-start gap-2 text-gray-600 group-hover:text-gray-800 transition-colors">
                          <Phone size={12} className="flex-shrink-0 text-gray-400 mt-0.5 group-hover:text-blue-500 transition-colors" />
                          <span className="truncate leading-tight break-all">{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="col-span-6 md:col-span-2 hidden xl:flex items-start">
                    <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
                      {member.specialties.slice(0, 2).map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex-shrink-0 shadow-sm group-hover:bg-blue-200 group-hover:shadow-md transition-all duration-200"
                        >
                          <Tag size={10} />
                          <span className="truncate max-w-[70px] leading-tight">{specialty}</span>
                        </span>
                      ))}
                      {member.specialties.length > 2 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex-shrink-0 shadow-sm group-hover:bg-gray-200 group-hover:shadow-md transition-all duration-200">
                          +{member.specialties.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-6 md:col-span-1 hidden lg:flex items-start justify-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full flex-shrink-0 shadow-sm whitespace-nowrap transition-all duration-200 ${
                        member.published
                          ? 'bg-green-100 text-green-800 border border-green-200 group-hover:bg-green-200 group-hover:shadow-md'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 group-hover:bg-gray-200 group-hover:shadow-md'
                      }`}
                    >
                      {member.published ? <Eye size={10} /> : <EyeOff size={10} />}
                      <span className="hidden sm:inline leading-tight">{member.published ? 'Published' : 'Draft'}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-6 md:col-span-1 flex items-start justify-end gap-1.5 w-20 min-w-[5rem] max-w-[5rem]">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110 hover:shadow-md"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110 hover:shadow-md"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Form Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingMember(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <ImageUpload
                  uploadType="team-member"
                  entityId={editingMember?.id || 'new'}
                  currentImageUrl={formData.photoUrl}
                  onUploadSuccess={handleImageUpload}
                  onImageRemove={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                  className="max-w-md"
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cardiologist"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="jane.smith@zenithmedical.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief professional biography..."
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialties
                </label>
                <input
                  type="text"
                  value={formData.specialties.join(', ')}
                  onChange={(e) => handleSpecialtiesChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cardiology, Internal Medicine, Emergency Care"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate multiple specialties with commas
                </p>
              </div>

              {/* Published Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMember(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      {editingMember ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingMember ? 'Update Member' : 'Create Member'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager; 