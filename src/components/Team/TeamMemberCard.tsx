/**
 * Team Member Card Component
 * Reusable card component for displaying team members in grid layouts
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  User, 
  Tag,
  ExternalLink
} from 'lucide-react';

// Types
export interface TeamMember {
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

interface TeamMemberCardProps {
  member: TeamMember;
  variant?: 'default' | 'compact' | 'detailed';
  showEmail?: boolean;
  showPhone?: boolean;
  showSpecialties?: boolean;
  showBio?: boolean;
  onClick?: (member: TeamMember) => void;
  className?: string;
  imageSize?: 'sm' | 'md' | 'lg';
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  variant = 'default',
  showEmail = true,
  showPhone = true,
  showSpecialties = true,
  showBio = true,
  onClick,
  className = '',
  imageSize = 'md'
}) => {
  const imageSizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const bioLength = {
    default: 120,
    compact: 80,
    detailed: 300
  };

  const truncateBio = (bio: string, maxLength: number) => {
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength).trim() + '...';
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(member);
    }
  };

  const cardClasses = `
    bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200
    hover:shadow-md hover:border-gray-300
    ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
    ${className}
  `;

  if (variant === 'compact') {
    return (
      <div 
        className={cardClasses}
        onClick={handleCardClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="p-4">
          <div className="flex items-center space-x-3">
            {/* Photo */}
            <div className={`${imageSizes[imageSize]} flex-shrink-0`}>
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="text-gray-500" size={imageSize === 'sm' ? 16 : 24} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {member.name}
              </h3>
              <p className="text-blue-600 font-medium text-sm truncate">
                {member.title}
              </p>
              
              {showSpecialties && member.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {member.specialties.slice(0, 2).map((specialty, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      <Tag size={10} />
                      {specialty}
                    </span>
                  ))}
                  {member.specialties.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{member.specialties.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {onClick && (
              <ExternalLink className="text-gray-400" size={16} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cardClasses}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Photo Section */}
      <div className="relative h-48 bg-gray-100">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <User className="text-gray-400" size={48} />
          </div>
        )}
        
        {/* Specialties Badge */}
        {showSpecialties && member.specialties.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white bg-opacity-90 text-blue-700 text-xs rounded-full font-medium">
              <Tag size={10} />
              {member.specialties.length} {member.specialties.length === 1 ? 'Specialty' : 'Specialties'}
            </span>
          </div>
        )}

        {/* Click indicator */}
        {onClick && (
          <div className="absolute top-3 right-3 opacity-0 hover:opacity-100 transition-opacity">
            <div className="p-1 bg-white bg-opacity-90 rounded-full">
              <ExternalLink className="text-gray-600" size={14} />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col">
        {/* Name and Title */}
        <div className="mb-4 flex flex-col">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {member.name}
          </h3>
          <p className="text-blue-600 font-medium">
            {member.title}
          </p>
        </div>

        {/* Bio */}
        {showBio && member.bio && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              {variant === 'detailed' 
                ? member.bio 
                : truncateBio(member.bio, bioLength[variant])
              }
            </p>
          </div>
        )}

        {/* Specialties */}
        {showSpecialties && member.specialties.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {(variant === 'detailed' ? member.specialties : member.specialties.slice(0, 3)).map((specialty, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  <Tag size={10} />
                  {specialty}
                </span>
              ))}
              {variant !== 'detailed' && member.specialties.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{member.specialties.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {(showEmail || showPhone) && (member.email || member.phone) && (
          <div className="space-y-2 pt-4 border-t border-gray-100">
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
  );
};

export default TeamMemberCard; 