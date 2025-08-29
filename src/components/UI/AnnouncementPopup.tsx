"use client";

import React, { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';

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
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (announcement.announcementEnabled && announcement.announcementMessage) {
      // Check if user has dismissed all announcements for this session
      const dismissedAll = sessionStorage.getItem('announcement-dismissed-all');
      if (dismissedAll) {
        return;
      }
      
      // Check if user has already dismissed this specific announcement for this session
      const dismissedKey = `announcement-dismissed-${announcement.announcementTitle}-${announcement.announcementMessage}`;
      const hasDismissed = sessionStorage.getItem(dismissedKey);
      
      if (!hasDismissed) {
        // Show popup after a short delay with animation
        const timer = setTimeout(() => {
          setIsVisible(true);
          setIsAnimating(true);
          // Remove animation class after animation completes
          setTimeout(() => setIsAnimating(false), 600);
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [announcement]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      
      // Mark as dismissed in sessionStorage
      const dismissedKey = `announcement-dismissed-${announcement.announcementTitle}-${announcement.announcementMessage}`;
      sessionStorage.setItem(dismissedKey, 'true');
      
      // If "don't show again" is checked, mark all announcements as dismissed for this session
      if (dontShowAgain) {
        sessionStorage.setItem('announcement-dismissed-all', 'true');
      }
    }, 300);
  };

  if (!isVisible || !announcement.announcementEnabled || !announcement.announcementMessage) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[60] transition-all duration-500 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup matching reference design */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-2xl mx-4 transition-all duration-500 ${
          isClosing ? 'scale-95 opacity-0 -translate-y-1/2' : 'scale-100 opacity-100 -translate-y-1/2'
        } ${isAnimating ? 'animate-bounce' : ''}`}
      >
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Red Banner */}
          <div className="bg-red-600 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-sm uppercase tracking-wider">
                Important Announcement
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-red-100 transition-colors p-1 rounded"
              aria-label="Close announcement"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Title Section */}
            <div className="flex items-start space-x-3 mb-4">
              <Megaphone className="h-6 w-6 text-gray-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {announcement.announcementTitle || 'Important Update'}
                </h3>
              </div>
            </div>

            {/* Message Content */}
            <div className="text-gray-700 leading-relaxed mb-6">
              <p className="mb-4">
                {announcement.announcementMessage}
              </p>
            </div>

            {/* Don't show again checkbox */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="dontShowAgain" className="ml-3 text-sm font-medium text-gray-700">
                  Don&apos;t show this type of announcement again this session
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-6 py-3 text-sm font-semibold rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
