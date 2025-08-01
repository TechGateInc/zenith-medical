'use client'

import React, { useEffect } from 'react'
import { X, MessageCircle, Users, Shield } from 'lucide-react'
import PatientChatInterface from './PatientChatInterface'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  submissionId: string
  patientName: string
  patientEmail: string
  isAdmin: boolean
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  submissionId,
  patientName,
  patientEmail,
  isAdmin
}) => {

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={onClose}
      />

      {/* Modern Drawer */}
      <div 
        className="fixed right-0 top-0 h-full bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out border-l border-gray-200 w-[480px] lg:w-[560px] xl:w-[640px] flex flex-col overflow-hidden"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        {/* Modern Header with gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {patientName}
                </h3>
                <div className="flex items-center text-blue-100 text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  <span className="truncate">{patientEmail}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Header decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <PatientChatInterface
            submissionId={submissionId}
            patientName={patientName}
            patientEmail={patientEmail}
            isAdmin={isAdmin}
            className="h-full border-none rounded-none bg-gray-50 flex flex-col"
          />
        </div>


      </div>
    </>
  )
}

// Floating Chat Button Component
interface FloatingChatButtonProps {
  onClick: () => void
  hasUnreadMessages?: boolean
  unreadCount?: number
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onClick,
  hasUnreadMessages = false,
  unreadCount = 0
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl z-30 border border-blue-500"
      title="Open patient chat"
    >
      <MessageCircle className="h-6 w-6" />
      {hasUnreadMessages && unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse"></div>
    </button>
  )
}