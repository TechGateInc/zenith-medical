/**
 * Team Member List Component
 * Simple list component for displaying team members in a vertical layout
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  User, 
  Tag,
  ChevronRight
} from 'lucide-react';
import { TeamMember } from './TeamMemberCard';

interface TeamMemberListProps {
  members: TeamMember[];
  showEmail?: boolean;
  showPhone?: boolean;
  showSpecialties?: boolean;
  showBio?: boolean;
  showAvatar?: boolean;
  onMemberClick?: (member: TeamMember) => void;
  className?: string;
  emptyMessage?: string;
  maxBioLength?: number;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  showEmail = false,
  showPhone = false,
  showSpecialties = true,
  showBio = true,
  showAvatar = true,
  onMemberClick,
  className = '',
  emptyMessage = 'No team members found.',
  maxBioLength = 100
}) => {
  const truncateBio = (bio: string, maxLength: number) => {
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength).trim() + '...';
  };

  const handleMemberClick = (member: TeamMember) => {
    if (onMemberClick) {
      onMemberClick(member);
    }
  };

  if (members.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <User className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {members.map((member, index) => (
        <div
          key={member.id}
          className={`
            bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200
            hover:shadow-md hover:border-gray-300
            ${onMemberClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            ${index === 0 ? '' : 'border-t-0 rounded-t-none'}
            ${index === members.length - 1 ? '' : 'rounded-b-none'}
          `}
          onClick={() => handleMemberClick(member)}
          role={onMemberClick ? 'button' : undefined}
          tabIndex={onMemberClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (onMemberClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleMemberClick(member);
            }
          }}
        >
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            {showAvatar && (
              <div className="flex-shrink-0 sm:block hidden md:block lg:block">
                {member.photoUrl ? (
                  <Image
                    src={member.photoUrl}
                    alt={member.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="text-gray-500" size={20} />
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Name and Title */}
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm truncate">
                    {member.title}
                  </p>
                </div>

                {/* Click indicator */}
                {onMemberClick && (
                  <div className="flex-shrink-0 ml-3">
                    <ChevronRight className="text-gray-400" size={16} />
                  </div>
                )}
              </div>

              {/* Bio */}
              {showBio && member.bio && (
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {truncateBio(member.bio, maxBioLength)}
                </p>
              )}

              {/* Specialties */}
              {showSpecialties && member.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {member.specialties.slice(0, 4).map((specialty, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      <Tag size={8} />
                      {specialty}
                    </span>
                  ))}
                  {member.specialties.length > 4 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{member.specialties.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Contact Information */}
              {(showEmail || showPhone) && (member.email || member.phone) && (
                <div className="flex flex-col sm:flex-row gap-4 mt-3 pt-3 border-t border-gray-100">
                  {showEmail && member.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      <a 
                        href={`mailto:${member.email}`}
                        className="hover:text-blue-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.email}
                      </a>
                    </div>
                  )}
                  
                  {showPhone && member.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      <a 
                        href={`tel:${member.phone}`}
                        className="hover:text-blue-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMemberList; 