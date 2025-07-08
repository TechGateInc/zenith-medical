/**
 * Team Member Grid Component
 * Container component for displaying multiple team members in responsive grid layouts
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, Grid, List, ChevronDown } from 'lucide-react';
import TeamMemberCard, { TeamMember } from './TeamMemberCard';

interface TeamMemberGridProps {
  members: TeamMember[];
  variant?: 'default' | 'compact' | 'detailed';
  showSearch?: boolean;
  showFilter?: boolean;
  showViewToggle?: boolean;
  columns?: 1 | 2 | 3 | 4;
  onMemberClick?: (member: TeamMember) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

type ViewMode = 'grid' | 'list';
type FilterBy = 'all' | 'published' | 'draft';

const TeamMemberGrid: React.FC<TeamMemberGridProps> = ({
  members,
  variant = 'default',
  showSearch = true,
  showFilter = false,
  showViewToggle = false,
  columns = 3,
  onMemberClick,
  className = '',
  emptyMessage = 'No team members found.',
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filter and search logic
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Apply published filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(member => 
        filterBy === 'published' ? member.published : !member.published
      );
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(search) ||
        member.title.toLowerCase().includes(search) ||
        member.bio?.toLowerCase().includes(search) ||
        member.specialties.some(specialty => 
          specialty.toLowerCase().includes(search)
        )
      );
    }

    return filtered;
  }, [members, searchTerm, filterBy]);

  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const gridGap = viewMode === 'grid' ? 'gap-6' : 'gap-3';

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Loading header */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Loading grid */}
        <div className={`grid ${gridColumns[columns]} ${gridGap}`}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      {(showSearch || showFilter || showViewToggle) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            {/* Search */}
            {showSearch && (
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search team members by name, title, bio, or specialties"
                />
              </div>
            )}

            {/* Filter */}
            {showFilter && (
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowFilterDropdown(!showFilterDropdown);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  role="button"
                  tabIndex={0}
                  aria-label="Filter team members"
                >
                  <Filter size={16} />
                  Filter
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} 
                  />
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      {(['all', 'published', 'draft'] as FilterBy[]).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => {
                            setFilterBy(filter);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                            filterBy === filter ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {filter === 'all' ? 'All Members' : 
                           filter === 'published' ? 'Published Only' : 'Drafts Only'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View toggle and results count */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
            </div>

            {showViewToggle && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid size={14} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List size={14} />
                  List
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team members grid/list */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterBy !== 'all' ? 'No matching team members' : 'No team members'}
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            {searchTerm || filterBy !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : emptyMessage
            }
          </p>
          {(searchTerm || filterBy !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? gridColumns[columns] : 'grid-cols-1'} ${gridGap}`}>
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              variant={viewMode === 'list' ? 'compact' : variant}
              onClick={onMemberClick}
              showEmail={variant !== 'compact'}
              showPhone={variant !== 'compact'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMemberGrid; 