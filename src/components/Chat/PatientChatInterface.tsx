'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, Clock, CheckCircle2, Wifi, WifiOff } from 'lucide-react'
import { useSocket } from '@/lib/websocket/useSocket'
import { useAuth } from '@/lib/auth/use-auth'

interface ChatMessage {
  id: string
  patientIntakeId: string
  content: string
  subject?: string | null
  senderType: 'PATIENT' | 'ADMIN'
  senderName: string
  senderEmail?: string | null
  adminUserId?: string | null
  isRead: boolean
  readAt?: string | null
  createdAt: string
  updatedAt: string
}

interface PatientChatInterfaceProps {
  submissionId: string
  patientName: string
  patientEmail: string
  isAdmin: boolean
  className?: string
}

export default function PatientChatInterface({
  submissionId,
  patientName,
  patientEmail,
  isAdmin,
  className = ''
}: PatientChatInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setMessageCounts] = useState({ total: 0, unreadForAdmin: 0, unreadForPatient: 0 })
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket connection (with fallback to polling)
  const { socketState, sendMessage: socketSendMessage, setTyping } = useSocket({
    submissionId,
    userType: isAdmin ? 'admin' : 'patient',
    token: undefined, // For development, we'll use a simpler auth approach
    onNewMessage: (message: ChatMessage) => {
      setMessages(prev => {
        // Remove any optimistic message with temp ID for the same content
        const withoutOptimistic = prev.filter(msg => 
          !msg.id.startsWith('temp-') || msg.content !== message.content
        )
        // Add the real message
        return [...withoutOptimistic, message]
      })
      setError(null)
    },
    onMessageCounts: (counts) => {
      setMessageCounts(counts)
    },
    onUserTyping: (data) => {
      if (data.userId !== user?.id && data.userId !== submissionId) {
        setTypingIndicator(data.senderName)
      }
    },
    onUserStoppedTyping: (data) => {
      if (data.userId !== user?.id && data.userId !== submissionId) {
        setTypingIndicator(null)
      }
    }
  })

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/intake/${submissionId}/messages`, {
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  // Send message via WebSocket or fallback to REST API
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    
    try {
      if (socketState.connected && socketState.authenticated) {
        // Create optimistic message for immediate display
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          patientIntakeId: submissionId,
          content: newMessage.trim(),
          senderType: isAdmin ? 'ADMIN' : 'PATIENT',
          senderName: isAdmin ? (user?.name || 'Admin') : patientName,
          senderEmail: isAdmin ? (user?.email || '') : patientEmail,
          adminUserId: isAdmin ? user?.id : undefined,
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Add optimistic message immediately
        setMessages(prev => [...prev, optimisticMessage])
        
        // Use WebSocket to send
        socketSendMessage({
          content: newMessage.trim(),
          senderName: isAdmin ? (user?.name || 'Admin') : patientName,
          senderEmail: isAdmin ? (user?.email || '') : patientEmail,
          adminUserId: isAdmin ? user?.id : undefined
        })
        
        // Clear input immediately
        setNewMessage('')
        setError(null)
      } else {
        // Fallback to REST API
        const response = await fetch(`/api/admin/intake/${submissionId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            content: newMessage.trim()
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to send message')
        }

        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        
        // Clear input for REST API
        setNewMessage('')
        setError(null)
      }
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Handle textarea auto-resize and typing indicators
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'

    // Handle typing indicators
    if (socketState.authenticated) {
      const senderName = isAdmin ? (user?.name || 'Admin') : patientName
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Send typing event
      setTyping(true, senderName)

      // Set timeout to stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false, senderName)
      }, 1000)
    }
  }

  // Handle Enter key to send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Load messages on component mount (only once)
  useEffect(() => {
    fetchMessages()
    // No polling needed - WebSocket handles real-time updates
  }, [submissionId])

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className || 'bg-white rounded-lg shadow-lg'}`}>
      {/* Compact Header for Admin Drawer Mode */}
      {isAdmin && className?.includes('border-none') && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              {socketState.connected && socketState.authenticated ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <Wifi className="h-3 w-3" />
                  <span>Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                  <WifiOff className="h-3 w-3" />
                  <span>Connecting</span>
                </div>
              )}

            </div>
          </div>
          <button
            onClick={fetchMessages}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh messages"
          >
            <Clock className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Regular Header for Non-Drawer Mode */}
      {!(isAdmin && className?.includes('border-none')) && (
        <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <MessageCircle className="h-5 w-5 text-blue-600 mr-3" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                Chat with {patientName}
              </h3>
              {/* Connection Status */}
              {socketState.connected && socketState.authenticated ? (
                <div title="Connected">
                  <Wifi className="h-4 w-4 text-green-500" />
                </div>
              ) : (
                <div title="Disconnected">
                  <WifiOff className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">{patientEmail}</p>

            </div>
          </div>
          <button
            onClick={fetchMessages}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Refresh messages"
          >
            <Clock className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Messages Area - Full Height with Bottom Alignment */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="min-h-full flex flex-col justify-end p-4 overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading conversation...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </div>
              <p className="text-red-600 mb-4 font-medium">{error}</p>
              <button
                onClick={fetchMessages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {isAdmin 
                  ? `Send a secure message to ${patientName}` 
                  : "Send a message to your healthcare team"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-sm lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
                      message.senderType === 'ADMIN'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white border border-gray-200 text-gray-900 shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium ${
                        message.senderType === 'ADMIN' ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {message.senderName}
                      </span>
                      <span className={`text-xs ${
                        message.senderType === 'ADMIN' ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {formatTime(message.createdAt)}
                      </span>
                      {message.senderType === 'ADMIN' && (
                        <CheckCircle2 className="h-3 w-3 text-blue-200" />
                      )}
                    </div>
                    <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingIndicator && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{typingIndicator} is typing</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Modern Message Input - Fixed at Bottom */}
      <div className="border-t border-gray-200 bg-white p-6">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={isAdmin 
                ? `Message ${patientName}...` 
                : "Type your message..."
              }
              className="w-full min-h-[48px] max-h-32 px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 placeholder-gray-400"
              disabled={sending}
              rows={1}
            />
            {/* Character indicator for longer messages */}
            {newMessage.length > 100 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {newMessage.length}/500
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-md"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Connection status at bottom */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {socketState.connected && socketState.authenticated ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected securely</span>
              </>
            ) : socketState.connected ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Connecting...</span>
              </>
            )}
          </div>
          <span>Messages are encrypted</span>
        </div>
        
        {/* Error states */}
        {socketState.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{socketState.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}