'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface UseSocketOptions {
  submissionId: string
  userType: 'admin' | 'patient'
  token?: string // JWT token for admin authentication
  onNewMessage?: (message: any) => void
  onMessageCounts?: (counts: { total: number, unreadForAdmin: number, unreadForPatient: number }) => void
  onUserTyping?: (data: { userId: string, senderName: string }) => void
  onUserStoppedTyping?: (data: { userId: string, senderName: string }) => void
  onUserConnected?: (data: { userType: string, userId: string }) => void
  onUserDisconnected?: (data: { userType: string, userId: string }) => void
  onCountUpdate?: (update: { type: string, count: number, submissionId?: string, unreadForAdmin?: number, unreadForPatient?: number }) => void
}

interface SocketState {
  connected: boolean
  authenticated: boolean
  error?: string
}

export function useSocket(options: UseSocketOptions) {
  const {
    submissionId,
    userType,
    token,
    onNewMessage,
    onMessageCounts,
    onUserTyping,
    onUserStoppedTyping,
    onUserConnected,
    onUserDisconnected,
    onCountUpdate
  } = options

  const socketRef = useRef<Socket | null>(null)
  const [socketState, setSocketState] = useState<SocketState>({
    connected: false,
    authenticated: false
  })
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const { data: session } = useSession()

  useEffect(() => {
    // Only connect if we have a submission ID
    if (!submissionId) return

    // Initialize socket connection
    const socket = io({
      path: '/api/socket',
      autoConnect: true
    })

    socketRef.current = socket

    // Connection handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setSocketState(prev => ({ ...prev, connected: true }))

      // Authenticate
      socket.emit('authenticate', {
        submissionId,
        userType,
        token // For admin auth, we'll implement a simpler approach in development
      })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setSocketState({ connected: false, authenticated: false })
      setTypingUsers(new Set())
    })

    // Authentication response
    socket.on('authenticated', (data: { success: boolean, error?: string, userType?: string, userId?: string }) => {
      if (data.success) {
        setSocketState(prev => ({ ...prev, authenticated: true, error: undefined }))
        console.log('Socket authenticated as:', data.userType, data.userId)
      } else {
        setSocketState(prev => ({ ...prev, authenticated: false, error: data.error }))
        console.error('Socket authentication failed:', data.error)
      }
    })

    // Message handlers
    socket.on('newMessage', (message) => {
      console.log('New message received:', message)
      onNewMessage?.(message)
    })

    socket.on('messageError', (error) => {
      console.error('Message error:', error)
      setSocketState(prev => ({ ...prev, error: error.error }))
    })

    socket.on('messageCounts', (counts) => {
      console.log('Message counts updated:', counts)
      onMessageCounts?.(counts)
    })

    // Typing indicators
    socket.on('userTyping', (data: { userId: string, senderName: string }) => {
      console.log('User typing:', data.senderName)
      setTypingUsers(prev => new Set([...prev, data.userId]))
      onUserTyping?.(data)
    })

    socket.on('userStoppedTyping', (data: { userId: string, senderName: string }) => {
      console.log('User stopped typing:', data.senderName)
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
      onUserStoppedTyping?.(data)
    })

    // User connection status
    socket.on('userConnected', (data) => {
      console.log('User connected:', data)
      onUserConnected?.(data)
    })

    socket.on('userDisconnected', (data) => {
      console.log('User disconnected:', data)
      onUserDisconnected?.(data)
    })

    socket.on('messagesRead', (data: { messageIds: string[], readBy: string }) => {
      console.log('Messages marked as read:', data)
      // This can be handled by the parent component if needed
    })

    // Count update handler
    socket.on('countUpdate', (update) => {
      console.log('Count update received:', update)
      onCountUpdate?.(update)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [submissionId, userType, token])

  // Socket actions
  const sendMessage = (messageData: {
    content: string
    subject?: string
    senderName: string
    senderEmail?: string
    adminUserId?: string
  }) => {
    if (!socketRef.current || !socketState.authenticated) {
      console.error('Socket not connected or authenticated')
      return
    }

    socketRef.current.emit('sendMessage', {
      submissionId,
      senderType: userType.toUpperCase() as 'PATIENT' | 'ADMIN',
      ...messageData
    })
  }

  const setTyping = (isTyping: boolean, senderName: string) => {
    if (!socketRef.current || !socketState.authenticated) return

    socketRef.current.emit('typing', {
      submissionId,
      senderName,
      isTyping
    })
  }

  const markAsRead = (messageIds: string[]) => {
    if (!socketRef.current || !socketState.authenticated || messageIds.length === 0) return

    socketRef.current.emit('markAsRead', {
      submissionId,
      messageIds
    })
  }

  return {
    socket: socketRef.current,
    socketState,
    typingUsers,
    sendMessage,
    setTyping,
    markAsRead
  }
}