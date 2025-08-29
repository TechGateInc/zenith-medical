"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AnnouncementData {
  announcementEnabled: boolean;
  announcementTitle?: string;
  announcementMessage?: string;
  announcementType?: string;
}

interface AnnouncementPopupProps {
  announcement: AnnouncementData;
}

export default function AnnouncementPopup({ announcement }: AnnouncementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (announcement.announcementEnabled && announcement.announcementMessage) {
      // Check if user has dismissed all announcements
      const dismissedAll = localStorage.getItem('announcement-dismissed-all');
      if (dismissedAll) {
        return;
      }
      
      // Check if user has already dismissed this specific announcement
      const dismissedKey = `announcement-dismissed-${announcement.announcementTitle}-${announcement.announcementMessage}`;
      const hasDismissed = localStorage.getItem(dismissedKey);
      
      if (!hasDismissed) {
        // Show popup after a short delay
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [announcement]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      
      // Mark as dismissed in localStorage
      const dismissedKey = `announcement-dismissed-${announcement.announcementTitle}-${announcement.announcementMessage}`;
      localStorage.setItem(dismissedKey, 'true');
      
      // If "don't show again" is checked, mark all announcements as dismissed
      if (dontShowAgain) {
        localStorage.setItem('announcement-dismissed-all', 'true');
      }
    }, 300);
  };

  const getIcon = () => {
    switch (announcement.announcementType) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (announcement.announcementType) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          closeButton: 'text-yellow-600 hover:text-yellow-800'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          closeButton: 'text-red-600 hover:text-red-800'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          closeButton: 'text-green-600 hover:text-green-800'
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          closeButton: 'text-blue-600 hover:text-blue-800'
        };
    }
  };

  if (!isVisible || !announcement.announcementEnabled || !announcement.announcementMessage) {
    return null;
  }

  const styles = getStyles();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className={`relative p-6 rounded-lg border shadow-lg ${styles.container}`}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors ${styles.closeButton}`}
            aria-label="Close announcement"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon and title */}
          <div className="flex items-start space-x-3 mb-4">
            {getIcon()}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${styles.title}`}>
                {announcement.announcementTitle || 'Important Notice'}
              </h3>
            </div>
          </div>

          {/* Message */}
          <div className={`text-sm leading-relaxed ${styles.message}`}>
            {announcement.announcementMessage}
          </div>

          {/* Don't show again checkbox */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="dontShowAgain" className="ml-2 text-sm text-gray-600">
              Don&apos;t show this type of announcement again
            </label>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                announcement.announcementType === 'warning' 
                  ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' 
                  : announcement.announcementType === 'error'
                  ? 'border-red-300 text-red-700 hover:bg-red-100'
                  : announcement.announcementType === 'success'
                  ? 'border-green-300 text-green-700 hover:bg-green-100'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-100'
              }`}
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
