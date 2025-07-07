import { prisma } from '../prisma'
import { notificationService } from './notification-service'
import { auditLog } from '../audit/audit-logger'

export interface ScheduledNotification {
  id: string
  type: 'reminder' | 'confirmation' | 'follow_up'
  appointmentId: string
  templateId: string
  scheduledFor: Date
  sent: boolean
  error?: string
}

export class NotificationScheduler {
  private isRunning = false
  private interval: NodeJS.Timeout | null = null

  constructor() {
    // Start the scheduler if in production
    if (process.env.NODE_ENV === 'production') {
      this.start()
    }
  }

  public start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Notification scheduler started')

    // Check for pending notifications every 5 minutes
    this.interval = setInterval(async () => {
      await this.processPendingNotifications()
    }, 5 * 60 * 1000)

    // Process immediately on start
    this.processPendingNotifications()
  }

  public stop() {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    console.log('Notification scheduler stopped')
  }

  private async processPendingNotifications() {
    try {
      console.log('Processing pending notifications...')

      // Get appointments that need reminders
      const appointmentsNeedingReminders = await this.getAppointmentsNeedingReminders()
      
      for (const appointment of appointmentsNeedingReminders) {
        await this.sendAppointmentReminder(appointment)
      }

      // Get appointments that need confirmations
      const appointmentsNeedingConfirmations = await this.getAppointmentsNeedingConfirmations()
      
      for (const appointment of appointmentsNeedingConfirmations) {
        await this.sendAppointmentConfirmation(appointment)
      }

      console.log(`Processed ${appointmentsNeedingReminders.length} reminders and ${appointmentsNeedingConfirmations.length} confirmations`)

    } catch (error) {
      console.error('Error processing notifications:', error)
    }
  }

  private async getAppointmentsNeedingReminders() {
    try {
      const twentyFourHoursFromNow = new Date()
      twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24)
      
      const twentyFiveHoursFromNow = new Date()
      twentyFiveHoursFromNow.setHours(twentyFiveHoursFromNow.getHours() + 25)

      // Find appointments scheduled for 24-25 hours from now that haven't had reminders sent
      const appointments = await prisma.appointment.findMany({
        where: {
          status: 'scheduled',
          reminderSent: false,
          appointmentDate: {
            gte: twentyFourHoursFromNow.toISOString().split('T')[0],
            lte: twentyFiveHoursFromNow.toISOString().split('T')[0]
          }
        },
        include: {
          patientIntake: {
            select: {
              legalFirstName: true,
              legalLastName: true,
              emailAddress: true,
              phoneNumber: true
            }
          }
        }
      })

      // Filter appointments that are actually in the 24-hour window
      return appointments.filter((appointment: any) => {
        const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`)
        const hoursUntilAppointment = (appointmentDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
        return hoursUntilAppointment >= 23 && hoursUntilAppointment <= 25
      })

    } catch (error) {
      console.error('Error getting appointments needing reminders:', error)
      return []
    }
  }

  private async getAppointmentsNeedingConfirmations() {
    try {
      // Find appointments created in the last hour that haven't had confirmations sent
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - 1)

      const appointments = await prisma.appointment.findMany({
        where: {
          status: 'scheduled',
          confirmationSent: false,
          createdAt: {
            gte: oneHourAgo
          }
        },
        include: {
          patientIntake: {
            select: {
              legalFirstName: true,
              legalLastName: true,
              emailAddress: true,
              phoneNumber: true
            }
          }
        }
      })

      return appointments

    } catch (error) {
      console.error('Error getting appointments needing confirmations:', error)
      return []
    }
  }

  private async sendAppointmentReminder(appointment: any) {
    try {
      // Get patient data from intake or appointment
      const patientName = appointment.patientIntake 
        ? `${appointment.patientIntake.legalFirstName} ${appointment.patientIntake.legalLastName}`
        : appointment.patientName

      const patientEmail = appointment.patientIntake?.emailAddress || appointment.patientEmail
      const patientPhone = appointment.patientIntake?.phoneNumber || appointment.patientPhone

      // Send reminder
      const result = await notificationService.sendAppointmentReminder({
        patientName,
        patientEmail,
        patientPhone,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentType: appointment.appointmentType,
        providerName: appointment.providerStaffName || appointment.providerName
      }, 'system')

      // Update appointment status
      if (result.success) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminderSent: true }
        })

        console.log(`Reminder sent for appointment ${appointment.id}`)
      } else {
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, result.error)
      }

      // Audit log
      await auditLog({
        action: 'APPOINTMENT_REMINDER_SENT',
        userId: 'system',
        userEmail: patientEmail,
        resource: 'appointment',
        resourceId: appointment.id,
        details: {
          patientName,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          success: result.success,
          error: result.error,
          messageId: result.messageId
        },
        ipAddress: 'system',
        userAgent: 'notification-scheduler'
      })

    } catch (error) {
      console.error(`Error sending reminder for appointment ${appointment.id}:`, error)
    }
  }

  private async sendAppointmentConfirmation(appointment: any) {
    try {
      // Get patient data from intake or appointment
      const patientName = appointment.patientIntake 
        ? `${appointment.patientIntake.legalFirstName} ${appointment.patientIntake.legalLastName}`
        : appointment.patientName

      const patientEmail = appointment.patientIntake?.emailAddress || appointment.patientEmail
      const patientPhone = appointment.patientIntake?.phoneNumber || appointment.patientPhone

      // Send confirmation
      const result = await notificationService.sendAppointmentConfirmation({
        patientName,
        patientEmail,
        patientPhone,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentType: appointment.appointmentType
      }, 'system')

      // Update appointment status
      if (result.success) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { confirmationSent: true }
        })

        console.log(`Confirmation sent for appointment ${appointment.id}`)
      } else {
        console.error(`Failed to send confirmation for appointment ${appointment.id}:`, result.error)
      }

      // Audit log
      await auditLog({
        action: 'APPOINTMENT_CONFIRMATION_SENT',
        userId: 'system',
        userEmail: patientEmail,
        resource: 'appointment',
        resourceId: appointment.id,
        details: {
          patientName,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          success: result.success,
          error: result.error,
          messageId: result.messageId
        },
        ipAddress: 'system',
        userAgent: 'notification-scheduler'
      })

    } catch (error) {
      console.error(`Error sending confirmation for appointment ${appointment.id}:`, error)
    }
  }

  public async scheduleAppointmentNotifications(appointmentId: string) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patientIntake: {
            select: {
              legalFirstName: true,
              legalLastName: true,
              emailAddress: true,
              phoneNumber: true
            }
          }
        }
      })

      if (!appointment) {
        throw new Error('Appointment not found')
      }

      // Send immediate confirmation if not already sent
      if (!appointment.confirmationSent) {
        await this.sendAppointmentConfirmation(appointment)
      }

      // Schedule reminder for 24 hours before (will be processed by the scheduler)
      console.log(`Notifications scheduled for appointment ${appointmentId}`)

    } catch (error) {
      console.error(`Error scheduling notifications for appointment ${appointmentId}:`, error)
    }
  }

  public async sendTestNotification(type: 'email' | 'sms' | 'both', to: { email?: string; phone?: string; name?: string }) {
    try {
      const notificationType = type === 'email' ? 'EMAIL' : type === 'sms' ? 'SMS' : 'BOTH'
      
      const result = await notificationService.sendNotification({
        type: notificationType,
        to,
        subject: 'Test Notification from Zenith Medical Centre',
        content: {
          email: `
            <h2>Test Email Notification</h2>
            <p>This is a test email to verify that the notification system is working correctly.</p>
            <p>If you received this email, the email notification service is configured properly.</p>
            <p>Best regards,<br>Zenith Medical Centre Team</p>
          `,
          sms: 'Test SMS: This is a test message from Zenith Medical Centre. Your SMS notifications are working!'
        },
        priority: 'normal'
      }, 'system')

      return result

    } catch (error) {
      console.error('Error sending test notification:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: !!this.interval,
      nextCheck: this.interval ? new Date(Date.now() + 5 * 60 * 1000) : null
    }
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down notification scheduler...')
  notificationScheduler.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Shutting down notification scheduler...')
  notificationScheduler.stop()
  process.exit(0)
}) 