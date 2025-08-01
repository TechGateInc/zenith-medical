/**
 * WebSocket Server for Real-time Patient Communication
 * Handles real-time messaging, typing indicators, and message counts
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { prisma } from '../prisma'
import { encryptPHI } from '../utils/encryption'
import jwt from 'jsonwebtoken'

interface SocketData {
  userId?: string
  userType: 'admin' | 'patient'
  submissionId?: string
  isAuthenticated: boolean
}

interface MessageData {
  submissionId: string
  content: string
  subject?: string
  senderType: 'PATIENT' | 'ADMIN'
  senderName: string
  senderEmail?: string
  adminUserId?: string
}

interface TypingData {
  submissionId: string
  senderName: string
  isTyping: boolean
}

export class MessageWebSocketServer {
  private io: SocketIOServer
  private connectedUsers = new Map<string, Set<string>>() // submissionId -> Set of socketIds
  private typingUsers = new Map<string, Map<string, NodeJS.Timeout>>() // submissionId -> userId -> timeout

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/api/socket'
    })

    this.setupSocketHandlers()
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Authentication
      socket.on('authenticate', async (data: { token?: string, submissionId?: string, userType: 'admin' | 'patient' }) => {
        try {
          let isAuthenticated = false
          let userId = ''
          let userType = data.userType

          if (data.userType === 'admin' && data.token) {
            // Verify admin JWT token
            const decoded = jwt.verify(data.token, process.env.NEXTAUTH_SECRET!) as any
            if (decoded?.sub) {
              isAuthenticated = true
              userId = decoded.sub
            }
          } else if (data.userType === 'patient' && data.submissionId) {
            // For patients, we use submission ID as authentication
            // Verify submission exists
            const submission = await prisma.patientIntake.findUnique({
              where: { id: data.submissionId }
            })
            if (submission) {
              isAuthenticated = true
              userId = data.submissionId
            }
          }

          if (isAuthenticated) {
            socket.data = {
              userId,
              userType,
              submissionId: data.submissionId,
              isAuthenticated: true
            } as SocketData

            // Join room for this submission
            if (data.submissionId) {
              socket.join(`submission:${data.submissionId}`)
              
              // Track connected users
              if (!this.connectedUsers.has(data.submissionId)) {
                this.connectedUsers.set(data.submissionId, new Set())
              }
              this.connectedUsers.get(data.submissionId)!.add(socket.id)

              // Emit user connected event
              socket.to(`submission:${data.submissionId}`).emit('userConnected', {
                userType: data.userType,
                userId
              })
            }

            socket.emit('authenticated', { success: true, userType, userId })
          } else {
            socket.emit('authenticated', { success: false, error: 'Authentication failed' })
          }
        } catch (error) {
          console.error('Authentication error:', error)
          socket.emit('authenticated', { success: false, error: 'Authentication failed' })
        }
      })

      // Send message
      socket.on('sendMessage', async (data: MessageData) => {
        try {
          if (!socket.data?.isAuthenticated || !socket.data.submissionId) {
            socket.emit('messageError', { error: 'Not authenticated' })
            return
          }

          // Validate message data
          if (!data.content || !data.content.trim()) {
            socket.emit('messageError', { error: 'Message content is required' })
            return
          }

          // Create message in database
          const newMessage = await (prisma as any).message.create({
            data: {
              patientIntakeId: data.submissionId,
              content: await encryptPHI(data.content.trim()),
              subject: data.subject ? await encryptPHI(data.subject.trim()) : null,
              senderType: data.senderType,
              senderName: await encryptPHI(data.senderName),
              senderEmail: data.senderEmail ? await encryptPHI(data.senderEmail) : null,
              adminUserId: data.adminUserId,
              ipAddress: socket.handshake.address,
              userAgent: socket.handshake.headers['user-agent'] || 'unknown'
            }
          })

          // Decrypt for broadcast
          const decryptedMessage = {
            id: newMessage.id,
            patientIntakeId: newMessage.patientIntakeId,
            content: data.content.trim(),
            subject: data.subject?.trim() || null,
            senderType: newMessage.senderType,
            senderName: data.senderName,
            senderEmail: data.senderEmail || null,
            adminUserId: newMessage.adminUserId,
            isRead: newMessage.isRead,
            readAt: newMessage.readAt,
            createdAt: newMessage.createdAt.toISOString(),
            updatedAt: newMessage.updatedAt.toISOString()
          }

          // Broadcast to all users in the submission room
          this.io.to(`submission:${data.submissionId}`).emit('newMessage', decryptedMessage)

          // Update message counts
          await this.updateMessageCounts(data.submissionId)

        } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('messageError', { error: 'Failed to send message' })
        }
      })

      // Typing indicators
      socket.on('typing', (data: TypingData) => {
        if (!socket.data?.isAuthenticated || !socket.data.submissionId) return

        const submissionId = data.submissionId
        const userId = socket.data.userId!

        if (data.isTyping) {
          // User started typing
          if (!this.typingUsers.has(submissionId)) {
            this.typingUsers.set(submissionId, new Map())
          }

          // Clear existing timeout for this user
          const existingTimeout = this.typingUsers.get(submissionId)!.get(userId)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
          }

          // Set new timeout (stop typing after 3 seconds of inactivity)
          const timeout = setTimeout(() => {
            this.typingUsers.get(submissionId)?.delete(userId)
            socket.to(`submission:${submissionId}`).emit('userStoppedTyping', {
              userId,
              senderName: data.senderName
            })
          }, 3000)

          this.typingUsers.get(submissionId)!.set(userId, timeout)

          // Broadcast typing event
          socket.to(`submission:${submissionId}`).emit('userTyping', {
            userId,
            senderName: data.senderName
          })
        } else {
          // User stopped typing
          const userTimeouts = this.typingUsers.get(submissionId)
          if (userTimeouts) {
            const existingTimeout = userTimeouts.get(userId)
            if (existingTimeout) {
              clearTimeout(existingTimeout)
              userTimeouts.delete(userId)
            }
          }

          socket.to(`submission:${submissionId}`).emit('userStoppedTyping', {
            userId,
            senderName: data.senderName
          })
        }
      })

      // Mark messages as read
      socket.on('markAsRead', async (data: { submissionId: string, messageIds: string[] }) => {
        try {
          if (!socket.data?.isAuthenticated) return

          await (prisma as any).message.updateMany({
            where: {
              id: { in: data.messageIds },
              patientIntakeId: data.submissionId,
              isRead: false
            },
            data: {
              isRead: true,
              readAt: new Date()
            }
          })

          // Broadcast read status update
          this.io.to(`submission:${data.submissionId}`).emit('messagesRead', {
            messageIds: data.messageIds,
            readBy: socket.data.userId
          })

          // Update message counts
          await this.updateMessageCounts(data.submissionId)

        } catch (error) {
          console.error('Error marking messages as read:', error)
        }
      })

      // Disconnect handling
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)

        if (socket.data?.submissionId) {
          const submissionId = socket.data.submissionId
          const userId = socket.data.userId!

          // Remove from connected users
          this.connectedUsers.get(submissionId)?.delete(socket.id)
          if (this.connectedUsers.get(submissionId)?.size === 0) {
            this.connectedUsers.delete(submissionId)
          }

          // Clear typing indicators
          const userTimeouts = this.typingUsers.get(submissionId)
          if (userTimeouts) {
            const timeout = userTimeouts.get(userId)
            if (timeout) {
              clearTimeout(timeout)
              userTimeouts.delete(userId)
            }
          }

          // Emit user disconnected
          socket.to(`submission:${submissionId}`).emit('userDisconnected', {
            userType: socket.data.userType,
            userId
          })
        }
      })
    })
  }

  private async updateMessageCounts(submissionId: string) {
    try {
      // Get total message count
      const totalMessages = await (prisma as any).message.count({
        where: { patientIntakeId: submissionId }
      })

      // Get unread message count for admin
      const unreadForAdmin = await (prisma as any).message.count({
        where: {
          patientIntakeId: submissionId,
          senderType: 'PATIENT',
          isRead: false
        }
      })

      // Get unread message count for patient
      const unreadForPatient = await (prisma as any).message.count({
        where: {
          patientIntakeId: submissionId,
          senderType: 'ADMIN',
          isRead: false
        }
      })

      // Broadcast updated counts
      this.io.to(`submission:${submissionId}`).emit('messageCounts', {
        total: totalMessages,
        unreadForAdmin,
        unreadForPatient
      })

    } catch (error) {
      console.error('Error updating message counts:', error)
    }
  }

  public getIO() {
    return this.io
  }
}

export default MessageWebSocketServer