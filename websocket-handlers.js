/**
 * WebSocket handlers for real-time updates
 * This file handles the Socket.IO server logic for chat and count updates
 */

const crypto = require('crypto')

// Import the same encryption functions used by the REST API
let encryptPHI, decryptPHI

try {
  // Try to use the same encryption functions as the TypeScript code
  const CryptoJS = require('crypto-js')
  
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!'
  const ENCRYPTION_IV = process.env.ENCRYPTION_IV || 'your-16-character-iv-here!'

  encryptPHI = function(data) {
    if (!data) return ''
    
    try {
      const keyWordArray = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY)
      const ivWordArray = CryptoJS.enc.Hex.parse(ENCRYPTION_IV)
      
      const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })

      return encrypted.toString()
    } catch (error) {
      console.error('Encryption failed:', error)
      return data // Return original if encryption fails
    }
  }

  decryptPHI = function(encryptedData) {
    if (!encryptedData) return ''

    try {
      const keyWordArray = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY)
      const ivWordArray = CryptoJS.enc.Hex.parse(ENCRYPTION_IV)
      
      const decrypted = CryptoJS.AES.decrypt(encryptedData, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
      return decryptedString || encryptedData // Return original if decryption fails
    } catch (error) {
      console.error('Decryption failed:', error)
      return encryptedData // Return original if decryption fails
    }
  }

  console.log('✅ Using CryptoJS encryption (same as REST API)')
} catch (error) {
  console.warn('⚠️ CryptoJS not available, using fallback encryption')
  
  // Fallback to basic encryption if CryptoJS is not available
  encryptPHI = function(text) {
    return text || '' // Just return the text as-is
  }

  decryptPHI = function(text) {
    return text || '' // Just return the text as-is
  }
}

// Initialize Prisma client (we'll use a simple require here)
let prisma
try {
  const { PrismaClient } = require('@prisma/client')
  prisma = new PrismaClient()
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
}

function initializeWebSocketHandlers(io) {
  console.log('Initializing WebSocket handlers...')

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Authentication handler
    socket.on('authenticate', async (data) => {
      try {
        if (data.userType === 'admin') {
          socket.data = { userType: 'admin', isAuthenticated: true, userId: 'admin-user' }
          await socket.join('admin-updates')
          socket.emit('authenticated', { success: true, userType: 'admin', userId: 'admin-user' })
          console.log('Admin authenticated:', socket.id)
        } else if (data.userType === 'patient' && data.submissionId) {
          if (prisma) {
            const submission = await prisma.patientIntake.findUnique({
              where: { id: data.submissionId },
              select: { id: true, emailAddress: true }
            })

            if (submission) {
              socket.data = { 
                userType: 'patient', 
                isAuthenticated: true, 
                userId: data.submissionId,
                submissionId: data.submissionId 
              }
              await socket.join(`submission-${data.submissionId}`)
              socket.emit('authenticated', { success: true, userType: 'patient', userId: data.submissionId })
              console.log('Patient authenticated:', socket.id, data.submissionId)
            } else {
              socket.emit('authenticated', { success: false, error: 'Invalid submission ID' })
            }
          } else {
            socket.emit('authenticated', { success: false, error: 'Database not available' })
          }
        } else {
          socket.emit('authenticated', { success: false, error: 'Invalid authentication data' })
        }
      } catch (error) {
        console.error('Authentication error:', error)
        socket.emit('authenticated', { success: false, error: 'Authentication failed' })
      }
    })

    // Send message handler
    socket.on('sendMessage', async (data) => {
      try {
        if (!socket.data?.isAuthenticated || !prisma) {
          socket.emit('messageError', { error: 'Not authenticated or database unavailable' })
          return
        }

        if (!data.content || !data.content.trim()) {
          socket.emit('messageError', { error: 'Message content is required' })
          return
        }

        // Create message in database
        const newMessage = await prisma.message.create({
          data: {
            patientIntakeId: data.submissionId,
            content: encryptPHI(data.content.trim()),
            subject: data.subject ? encryptPHI(data.subject.trim()) : null,
            senderType: data.senderType,
            senderName: encryptPHI(data.senderName),
            senderEmail: data.senderEmail ? encryptPHI(data.senderEmail) : null,
            adminUserId: data.adminUserId,
            isRead: false,
            ipAddress: socket.handshake.address,
            userAgent: socket.handshake.headers['user-agent'] || 'Unknown'
          }
        })

        // Decrypt for broadcasting
        const decryptedMessage = {
          id: newMessage.id,
          content: decryptPHI(newMessage.content),
          subject: newMessage.subject ? decryptPHI(newMessage.subject) : undefined,
          senderType: newMessage.senderType,
          senderName: decryptPHI(newMessage.senderName),
          senderEmail: newMessage.senderEmail ? decryptPHI(newMessage.senderEmail) : undefined,
          adminUserId: newMessage.adminUserId,
          isRead: newMessage.isRead,
          readAt: newMessage.readAt,
          createdAt: newMessage.createdAt,
          updatedAt: newMessage.updatedAt
        }

        // Broadcast to submission room
        io.to(`submission-${data.submissionId}`).emit('newMessage', decryptedMessage)
        
        // Update message counts
        await updateMessageCounts(io, data.submissionId)

        console.log('Message sent:', newMessage.id)
      } catch (error) {
        console.error('Send message error:', error)
        socket.emit('messageError', { error: 'Failed to send message' })
      }
    })

    // Mark messages as read handler
    socket.on('markAsRead', async (data) => {
      try {
        if (!socket.data?.isAuthenticated || !prisma) return

        await prisma.message.updateMany({
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
        io.to(`submission-${data.submissionId}`).emit('messagesRead', {
          messageIds: data.messageIds,
          readBy: socket.data.userType
        })

        // Update message counts
        await updateMessageCounts(io, data.submissionId)

        console.log('Messages marked as read:', data.messageIds.length)
      } catch (error) {
        console.error('Mark as read error:', error)
      }
    })

    // Typing indicator handlers
    socket.on('typing', (data) => {
      if (!socket.data?.isAuthenticated) return

      if (data.isTyping) {
        socket.to(`submission-${data.submissionId}`).emit('userTyping', {
          userId: socket.data.userId,
          senderName: data.senderName
        })
      } else {
        socket.to(`submission-${data.submissionId}`).emit('userStoppedTyping', {
          userId: socket.data.userId,
          senderName: data.senderName
        })
      }
    })

    // Request count updates
    socket.on('requestCounts', async () => {
      if (!socket.data?.isAuthenticated || !prisma) return

      if (socket.data.userType === 'admin') {
        await sendAdminCounts(socket)
      } else if (socket.data.submissionId) {
        await updateMessageCounts(io, socket.data.submissionId)
      }
    })

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  // Helper function to send admin counts
  async function sendAdminCounts(socket) {
    try {
      if (!prisma) return

      // Intake count
      const intakeCount = await prisma.patientIntake.count({
        where: { viewedAt: null }
      })

      socket.emit('countUpdate', {
        type: 'intake_count',
        count: intakeCount
      })

      console.log('Admin counts sent:', { intakeCount })
    } catch (error) {
      console.error('Error sending admin counts:', error)
    }
  }

  // Helper function to update message counts
  async function updateMessageCounts(io, submissionId) {
    try {
      if (!prisma) return

      // Get total message count
      const totalMessages = await prisma.message.count({
        where: { patientIntakeId: submissionId }
      })

      // Get unread message count for admin
      const unreadForAdmin = await prisma.message.count({
        where: {
          patientIntakeId: submissionId,
          senderType: 'PATIENT',
          isRead: false
        }
      })

      // Get unread message count for patient
      const unreadForPatient = await prisma.message.count({
        where: {
          patientIntakeId: submissionId,
          senderType: 'ADMIN',
          isRead: false
        }
      })

      const countUpdate = {
        type: 'message_count',
        count: totalMessages,
        submissionId,
        unreadForAdmin,
        unreadForPatient
      }

      // Broadcast to submission room
      io.to(`submission-${submissionId}`).emit('messageCounts', {
        total: totalMessages,
        unreadForAdmin,
        unreadForPatient
      })

      // Also broadcast to admin room for dashboard updates
      io.to('admin-updates').emit('countUpdate', countUpdate)

      console.log('Message counts updated:', countUpdate)
    } catch (error) {
      console.error('Error updating message counts:', error)
    }
  }

  // Global function to broadcast intake count updates
  global.broadcastIntakeCountUpdate = async function() {
    try {
      if (!prisma) return

      const intakeCount = await prisma.patientIntake.count({
        where: { viewedAt: null }
      })

      io.to('admin-updates').emit('countUpdate', {
        type: 'intake_count',
        count: intakeCount
      })

      console.log('Intake count broadcasted:', intakeCount)
    } catch (error) {
      console.error('Error broadcasting intake count:', error)
    }
  }

  console.log('✅ WebSocket handlers initialized successfully')
}

module.exports = { initializeWebSocketHandlers }