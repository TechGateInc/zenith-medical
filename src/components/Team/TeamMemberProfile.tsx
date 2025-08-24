/**
 * Team Member Profile Component
 * Detailed profile component for displaying individual team member information
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  User, 
  Tag,
  Calendar,
  Award,
  X
} from 'lucide-react';
import type { TeamMember } from './TeamMemberCard';

interface TeamMemberProfileProps {
  member: TeamMember;
  showContactInfo?: boolean;
  showJoinDate?: boolean;
  showFullBio?: boolean;
  onClose?: () => void;
  variant?: 'modal' | 'page' | 'card';
  className?: string;
}

const TeamMemberProfile: React.FC<TeamMemberProfileProps> = ({
  member,
  showContactInfo = true,
  showJoinDate = true,
  showFullBio = true,
  onClose,
  variant = 'card',
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const containerClasses = {
    modal: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto',
    page: 'bg-white',
    card: 'bg-white rounded-lg shadow-sm border border-gray-200'
  };

  const paddingClasses = {
    modal: 'p-6',
    page: 'p-8',
    card: 'p-6'
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* Header with close button for modal */}
      {variant === 'modal' && onClose && (
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Team Member Profile</h2>
          <button
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            role="button"
            tabIndex={0}
            aria-label="Close profile"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      )}

      <div className={paddingClasses[variant]}>
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row gap-6 mb-8">
          {/* Photo */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.name}
                width={160}
                height={160}
                className="w-40 h-40 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
                <User className="text-gray-500" size={64} />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center sm:text-left md:text-left lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {member.name}
            </h1>
            <p className="text-xl text-blue-600 font-semibold mb-4">
              {member.title}
            </p>

            {/* Status Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                member.published 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  member.published ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                {member.published ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Join Date */}
            {showJoinDate && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 mb-4">
                <Calendar size={16} />
                <span className="text-sm">
                  Joined {formatDate(member.createdAt)}
                </span>
              </div>
            )}

            {/* Quick Contact */}
            {showContactInfo && (member.email || member.phone) && (
              <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row gap-3 justify-center sm:justify-start md:justify-start lg:justify-start">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail size={16} />
                    Email
                  </a>
                )}
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Phone size={16} />
                    Call
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {showFullBio && member.bio && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About {member.name.split(' ')[0]}
            </h3>
            <div className="prose prose-gray max-w-none">
              {member.bio.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information Section */}
        {showContactInfo && (member.email || member.phone) && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {member.email && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Mail className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {member.email}
                    </a>
                  </div>
                </div>
              )}

              {member.phone && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Phone className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a 
                      href={`tel:${member.phone}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {member.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata Section (for admin view) */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Order Index:</span> {member.orderIndex}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {formatDate(member.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfile; 