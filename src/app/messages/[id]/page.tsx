'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Send, MessageCircle, Clock, CheckCircle2, AlertCircle, Stethoscope, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { useSocket } from '@/lib/websocket/useSocket'

interface ChatMessage {
  id: string
  content: string
  subject?: string | null
  senderType: 'PATIENT' | 'ADMIN'
  senderName: string
  isRead: boolean
  readAt?: string | null
  createdAt: string
  updatedAt: string
}

export default function PatientMessagesPage() {
  const params = useParams()
  const submissionId = params.id as string
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [patientName, setPatientName] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageCounts, setMessageCounts] = useState({ total: 0, unreadForAdmin: 0, unreadForPatient: 0 })
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket connection
  const { socketState, sendMessage: socketSendMessage, setTyping } = useSocket({
    submissionId,
    userType: 'patient',
    onNewMessage: (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
      setError(null)
    },
    onMessageCounts: (counts) => {
      setMessageCounts(counts)
    },
    onUserTyping: (data) => {
      setTypingIndicator(data.senderName)
    },
    onUserStoppedTyping: () => {
      setTypingIndicator(null)
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
      const response = await fetch(`/api/messages/${submissionId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
      setPatientName(data.patientName || '')
      setError(null)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  // Send message via WebSocket
  const sendMessage = () => {
    if (!newMessage.trim() || sending || !socketState.authenticated) return
    if (messages.length === 0 && !patientEmail.trim()) return

    setSending(true)
    
    socketSendMessage({
      content: newMessage.trim(),
      senderName: patientName,
      senderEmail: patientEmail.trim() || undefined
    })

    setNewMessage('')
    setSending(false)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
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
    if (socketState.authenticated && patientName) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Send typing event
      setTyping(true, patientName)

      // Set timeout to stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false, patientName)
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
    if (submissionId) {
      fetchMessages()
      // No polling needed - WebSocket handles real-time updates
    }
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
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl">
        <div className="w-[45vw] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Zenith Medical Centre</h1>
                <p className="text-blue-100">Secure Patient Communication Portal</p>
              </div>
            </div>
            <Link 
              href="/"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex-1 w-[45vw] mx-auto p-4 flex flex-col overflow-hidden">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex-1 flex flex-col border border-gray-200 h-full">
          {/* Modern Chat Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Messages</h2>
                  <div className="flex items-center gap-4 mt-1">
                    {patientName && (
                      <p className="text-gray-600">Welcome, {patientName}</p>
                    )}
                    {/* Connection Status */}
                    {socketState.connected && socketState.authenticated ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        <Wifi className="h-3 w-3" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                        <WifiOff className="h-3 w-3" />
                        <span>Connecting...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={fetchMessages}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh messages"
              >
                <Clock className="h-5 w-5" />
              </button>
            </div>
          </div>



          {/* Messages Area - Full Height */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-gray-50 to-white p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading messages...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 mb-3">{error}</p>
                <button
                  onClick={fetchMessages}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Try again
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Your Conversation</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  Your healthcare team is ready to assist you. Send a message below to get started with secure, 
                  professional communication about your health and care.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'PATIENT' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`min-w-[70%] max-w-[90%] px-5 py-4 rounded-2xl shadow-sm ${
                        message.senderType === 'PATIENT'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-white border border-gray-200 text-gray-900 shadow-md'
                      }`}
                    >
                      {message.senderType === 'ADMIN' && (
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-blue-600">{message.senderName}</span>
                            <div className="text-xs text-gray-500">Healthcare Team</div>
                          </div>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                      <div
                        className={`flex items-center justify-between mt-3 text-xs ${
                          message.senderType === 'PATIENT' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        <span>{formatTime(message.createdAt)}</span>
                        {message.senderType === 'PATIENT' && (
                          <div className="flex items-center">
                            <CheckCircle2 className="h-3 w-3 ml-2" />
                            <span className="ml-1">Sent</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {typingIndicator && (
                  <div className="flex justify-start">
                    <div className="min-w-[50%] max-w-[70%] px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 shadow-sm">
                      <div className="flex items-center mb-2">
                        <Stethoscope className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-600">{typingIndicator}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">is typing</span>
                        <div className="flex space-x-1 ml-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Modern Message Input - Fixed at Bottom */}
          <div className="border-t border-gray-200 bg-white p-6">
            {/* Email input for first message */}
            {messages.length === 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  required
                />
                <div className="flex items-center mt-2 text-xs text-gray-600">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                  Required for secure identity verification
                </div>
              </div>
            )}
            
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={handleTextareaChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full min-h-[52px] max-h-32 px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 placeholder-gray-400 bg-gray-50 focus:bg-white"
                  rows={1}
                />
                {/* Character indicator for longer messages */}
                {newMessage.length > 100 && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {newMessage.length}/1000
                  </div>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim() || (messages.length === 0 && !patientEmail.trim()) || !socketState.authenticated}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-md"
                title={!socketState.authenticated ? 'Connecting...' : 'Send message'}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Connection status at bottom */}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
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
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{socketState.error}</p>
              </div>
            )}
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}