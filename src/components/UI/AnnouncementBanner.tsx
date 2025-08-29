"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  if (typeof window !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  // Fallback for server-side rendering
  return html.replace(/<[^>]*>/g, '');
};

interface AnnouncementData {
  announcementEnabled: boolean;
  announcementTitle?: string;
  announcementMessage?: string;
  announcementType?: string;
}

interface AnnouncementBannerProps {
  announcement: AnnouncementData;
}

export default function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (announcement.announcementEnabled && announcement.announcementMessage) {
      // Check if user has dismissed this announcement
      const dismissedKey = `announcement-banner-dismissed-${announcement.announcementTitle}-${announcement.announcementMessage}`;
      const hasDismissed = localStorage.getItem(dismissedKey);
      
      if (!hasDismissed) {
        setIsVisible(true);
      }
    }
  }, [announcement]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      
      // Mark as dismissed in localStorage
      const dismissedKey = `announcement-banner-dismissed-${announcement.announcementTitle}-${announcement.announcementMessage}`;
      localStorage.setItem(dismissedKey, 'true');
    }, 300);
  };

  const getIcon = () => {
    switch (announcement.announcementType) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (announcement.announcementType) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-b border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          closeButton: 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-b border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          closeButton: 'text-red-600 hover:text-red-800 hover:bg-red-100'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-b border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          closeButton: 'text-green-600 hover:text-green-800 hover:bg-green-100'
        };
      default:
        return {
          container: 'bg-blue-50 border-b border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          closeButton: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
        };
    }
  };

  if (!isVisible || !announcement.announcementEnabled || !announcement.announcementMessage) {
    return null;
  }

  const styles = getStyles();

  return (
    <div 
      className={`${styles.container} transition-all duration-300 ${
        isClosing ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-3 flex-1 w-full">
            {getIcon()}
            <div className="flex-1 min-w-0 w-full">
              {announcement.announcementTitle && (
                <h3 className={`text-sm font-semibold ${styles.title} mb-1`}>
                  {announcement.announcementTitle}
                </h3>
              )}
              <p className={`text-sm ${styles.message} leading-relaxed w-full`}>
                {stripHtml(announcement.announcementMessage || '')}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className={`ml-4 p-1 rounded-full transition-colors ${styles.closeButton}`}
            aria-label="Close announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
