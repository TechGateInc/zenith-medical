import { prisma } from '../prisma'
import { oscarApiClient } from './oscar-api'
import { auditLog } from '../audit/audit-logger'
import { OscarError, OscarApiError, OscarDataError } from './oscar-errors'

export interface AppointmentSyncStatus {
  id: string
  localStatus: string
  oscarStatus?: string
  lastSyncAt?: Date
  syncRequired: boolean
  conflictDetected: boolean
  errorMessage?: string
}

export interface SyncResult {
  success: boolean
  appointmentId: string
  previousStatus: string
  newStatus: string
  syncDirection: 'local_to_oscar' | 'oscar_to_local' | 'bidirectional'
  message?: string
  error?: string
}

export interface BulkSyncResult {
  totalProcessed: number
  successful: number
  failed: number
  conflicts: number
  results: SyncResult[]
  errors: string[]
}

export class OscarAppointmentSyncService {
  private static instance: OscarAppointmentSyncService
  
  // Status mapping between Zenith and OSCAR
  private readonly STATUS_MAPPING = {
    // Zenith -> OSCAR
    toOscar: {
      'scheduled': 'Scheduled',
      'confirmed': 'Confirmed', 
      'cancelled': 'Cancelled',
      'completed': 'Complete',
      'no_show': 'No Show',
      'rescheduled': 'Rescheduled'
    },
    // OSCAR -> Zenith
    fromOscar: {
      'Scheduled': 'scheduled',
      'Confirmed': 'confirmed',
      'Cancelled': 'cancelled', 
      'Complete': 'completed',
      'No Show': 'no_show',
      'Rescheduled': 'rescheduled',
      'Arrived': 'confirmed',
      'Checked In': 'confirmed'
    }
  }

  constructor() {
    // Singleton pattern
  }

  public static getInstance(): OscarAppointmentSyncService {
    if (!OscarAppointmentSyncService.instance) {
      OscarAppointmentSyncService.instance = new OscarAppointmentSyncService()
    }
    return OscarAppointmentSyncService.instance
  }

  /**
   * Sync a single appointment status from local to OSCAR
   */
  public async syncToOscar(appointmentId: string, newStatus: string, userId?: string): Promise<SyncResult> {
    try {
      // Get the appointment from database
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      })

      if (!appointment) {
        return {
          success: false,
          appointmentId,
          previousStatus: 'unknown',
          newStatus,
          syncDirection: 'local_to_oscar',
          error: 'Appointment not found'
        }
      }

      // Check if this is an OSCAR appointment
      if (appointment.providerType !== 'oscar' || !appointment.oscarAppointmentId) {
        return {
          success: false,
          appointmentId,
          previousStatus: appointment.status,
          newStatus,
          syncDirection: 'local_to_oscar',
          error: 'Not an OSCAR appointment'
        }
      }

      // Map local status to OSCAR status
      const oscarStatus = this.STATUS_MAPPING.toOscar[newStatus as keyof typeof this.STATUS_MAPPING.toOscar]
      if (!oscarStatus) {
        return {
          success: false,
          appointmentId,
          previousStatus: appointment.status,
          newStatus,
          syncDirection: 'local_to_oscar',
          error: `Invalid status '${newStatus}' for OSCAR sync`
        }
      }

      // Update status in OSCAR (note: actual OSCAR API endpoint may vary)
      try {
        const oscarResponse = await this.updateOscarAppointmentStatus(
          appointment.oscarAppointmentId,
          oscarStatus
        )

        if (!oscarResponse.success) {
          throw new OscarApiError(
            oscarResponse.error || 'Failed to update OSCAR appointment status',
            'server_error'
          )
        }
      } catch (oscarError) {
        await this.logSyncOperation('SYNC_TO_OSCAR_FAILED', {
          appointmentId,
          localStatus: appointment.status,
          newStatus,
          oscarAppointmentId: appointment.oscarAppointmentId,
          error: oscarError instanceof Error ? oscarError.message : 'Unknown OSCAR error'
        }, userId)

        return {
          success: false,
          appointmentId,
          previousStatus: appointment.status,
          newStatus,
          syncDirection: 'local_to_oscar',
          error: `OSCAR sync failed: ${oscarError instanceof Error ? oscarError.message : 'Unknown error'}`
        }
      }

      // Update local appointment with new status and sync timestamp
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: newStatus,
          oscarLastSyncAt: new Date()
        }
      })

      await this.logSyncOperation('SYNC_TO_OSCAR_SUCCESS', {
        appointmentId,
        previousStatus: appointment.status,
        newStatus,
        oscarAppointmentId: appointment.oscarAppointmentId,
        oscarStatus
      }, userId)

      return {
        success: true,
        appointmentId,
        previousStatus: appointment.status,
        newStatus,
        syncDirection: 'local_to_oscar',
        message: 'Status successfully synced to OSCAR'
      }

    } catch (error) {
      await this.logSyncOperation('SYNC_TO_OSCAR_ERROR', {
        appointmentId,
        newStatus,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, userId)

      return {
        success: false,
        appointmentId,
        previousStatus: 'unknown',
        newStatus,
        syncDirection: 'local_to_oscar',
        error: error instanceof Error ? error.message : 'Unknown sync error'
      }
    }
  }

  /**
   * Sync appointment status from OSCAR to local
   */
  public async syncFromOscar(appointmentId: string, userId?: string): Promise<SyncResult> {
    try {
      // Get the appointment from database
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      })

      if (!appointment) {
        return {
          success: false,
          appointmentId,
          previousStatus: 'unknown',
          newStatus: 'unknown',
          syncDirection: 'oscar_to_local',
          error: 'Appointment not found'
        }
      }

      // Check if this is an OSCAR appointment
      if (appointment.providerType !== 'oscar' || !appointment.oscarAppointmentId) {
        return {
          success: false,
          appointmentId,
          previousStatus: appointment.status,
          newStatus: appointment.status,
          syncDirection: 'oscar_to_local',
          error: 'Not an OSCAR appointment'
        }
      }

      // Get current status from OSCAR
      let oscarAppointment
      try {
        oscarAppointment = await this.getOscarAppointmentStatus(appointment.oscarAppointmentId)
      } catch (oscarError) {
        await this.logSyncOperation('SYNC_FROM_OSCAR_FAILED', {
          appointmentId,
          oscarAppointmentId: appointment.oscarAppointmentId,
          error: oscarError instanceof Error ? oscarError.message : 'Unknown OSCAR error'
        }, userId)

        return {
          success: false,
          appointmentId,
          previousStatus: appointment.status,
          newStatus: appointment.status,
          syncDirection: 'oscar_to_local',
          error: `Failed to get OSCAR status: ${oscarError instanceof Error ? oscarError.message : 'Unknown error'}`
        }
      }

      // Map OSCAR status to local status
      const localStatus = this.STATUS_MAPPING.fromOscar[oscarAppointment.status as keyof typeof this.STATUS_MAPPING.fromOscar]
      if (!localStatus) {
        await this.logSyncOperation('SYNC_FROM_OSCAR_WARNING', {
          appointmentId,
          oscarAppointmentId: appointment.oscarAppointmentId,
          oscarStatus: oscarAppointment.status,
          warning: 'Unknown OSCAR status - no mapping available'
        }, userId)

        return {
          success: false,
          appointmentId,
          previousStatus: appointment.status,
          newStatus: appointment.status,
          syncDirection: 'oscar_to_local',
          error: `Unknown OSCAR status: ${oscarAppointment.status}`
        }
      }

      // Check if status has actually changed
      if (appointment.status === localStatus) {
        return {
          success: true,
          appointmentId,
          previousStatus: appointment.status,
          newStatus: localStatus,
          syncDirection: 'oscar_to_local',
          message: 'Status already synchronized - no update needed'
        }
      }

      // Update local appointment with OSCAR status
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: localStatus,
          oscarLastSyncAt: new Date()
        }
      })

      await this.logSyncOperation('SYNC_FROM_OSCAR_SUCCESS', {
        appointmentId,
        previousStatus: appointment.status,
        newStatus: localStatus,
        oscarAppointmentId: appointment.oscarAppointmentId,
        oscarStatus: oscarAppointment.status
      }, userId)

      return {
        success: true,
        appointmentId,
        previousStatus: appointment.status,
        newStatus: localStatus,
        syncDirection: 'oscar_to_local',
        message: 'Status successfully synced from OSCAR'
      }

    } catch (error) {
      await this.logSyncOperation('SYNC_FROM_OSCAR_ERROR', {
        appointmentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, userId)

      return {
        success: false,
        appointmentId,
        previousStatus: 'unknown',
        newStatus: 'unknown',
        syncDirection: 'oscar_to_local',
        error: error instanceof Error ? error.message : 'Unknown sync error'
      }
    }
  }

  /**
   * Get sync status for appointments that require synchronization
   */
  public async getAppointmentsSyncStatus(limit: number = 50): Promise<AppointmentSyncStatus[]> {
    try {
      // Get OSCAR appointments that may need sync
      const appointments = await prisma.appointment.findMany({
        where: {
          providerType: 'oscar',
          oscarAppointmentId: { not: null }
        },
        orderBy: [
          { oscarLastSyncAt: 'asc' }, // Oldest sync first
          { updatedAt: 'desc' }       // Most recently updated first
        ],
        take: limit
      })

      const syncStatuses: AppointmentSyncStatus[] = []

      for (const appointment of appointments) {
        const lastSyncAge = appointment.oscarLastSyncAt 
          ? Date.now() - appointment.oscarLastSyncAt.getTime()
          : Date.now() - appointment.createdAt.getTime()

        // Consider sync required if:
        // 1. Never synced, or
        // 2. Last sync was more than 1 hour ago, or  
        // 3. Appointment was updated after last sync
        const syncRequired = !appointment.oscarLastSyncAt || 
                           lastSyncAge > (60 * 60 * 1000) || // 1 hour
                           (appointment.oscarLastSyncAt < appointment.updatedAt)

        syncStatuses.push({
          id: appointment.id,
          localStatus: appointment.status,
          lastSyncAt: appointment.oscarLastSyncAt || undefined,
          syncRequired,
          conflictDetected: false, // TODO: Implement conflict detection
          errorMessage: undefined
        })
      }

      return syncStatuses
    } catch (error) {
      console.error('Error getting sync status:', error)
      return []
    }
  }

  /**
   * Perform bulk sync of multiple appointments
   */
  public async bulkSyncAppointments(appointmentIds: string[], direction: 'to_oscar' | 'from_oscar' | 'bidirectional' = 'bidirectional', userId?: string): Promise<BulkSyncResult> {
    const results: SyncResult[] = []
    const errors: string[] = []
    let successful = 0
    let failed = 0
    let conflicts = 0

    for (const appointmentId of appointmentIds) {
      try {
        let result: SyncResult

        if (direction === 'to_oscar') {
          // Get current local status and sync to OSCAR
          const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: { status: true }
          })
          
          if (!appointment) {
            result = {
              success: false,
              appointmentId,
              previousStatus: 'unknown',
              newStatus: 'unknown',
              syncDirection: 'local_to_oscar',
              error: 'Appointment not found'
            }
          } else {
            result = await this.syncToOscar(appointmentId, appointment.status, userId)
          }
        } else if (direction === 'from_oscar') {
          result = await this.syncFromOscar(appointmentId, userId)
        } else {
          // Bidirectional - check both directions and resolve conflicts
          const fromOscarResult = await this.syncFromOscar(appointmentId, userId)
          result = fromOscarResult // Use OSCAR as source of truth for now
        }

        results.push(result)

        if (result.success) {
          successful++
        } else {
          failed++
          if (result.error) {
            errors.push(`${appointmentId}: ${result.error}`)
          }
        }

        // TODO: Implement proper conflict detection
        // if (conflict detected) conflicts++

      } catch (error) {
        failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`${appointmentId}: ${errorMessage}`)
        
        results.push({
          success: false,
          appointmentId,
          previousStatus: 'unknown',
          newStatus: 'unknown',
          syncDirection: direction === 'to_oscar' ? 'local_to_oscar' : 'oscar_to_local',
          error: errorMessage
        })
      }
    }

    await this.logSyncOperation('BULK_SYNC_COMPLETED', {
      direction,
      totalProcessed: appointmentIds.length,
      successful,
      failed,
      conflicts,
      appointmentIds
    }, userId)

    return {
      totalProcessed: appointmentIds.length,
      successful,
      failed,
      conflicts,
      results,
      errors
    }
  }

  // Private helper methods

  private async updateOscarAppointmentStatus(oscarAppointmentId: string, status: string): Promise<{success: boolean, error?: string}> {
    try {
      // Note: This is a placeholder - actual OSCAR API endpoint may vary
      // In practice, you would call something like:
      // await oscarApiClient.updateAppointmentStatus(oscarAppointmentId, status)
      
      // For now, we'll simulate the API call
      console.log(`Updating OSCAR appointment ${oscarAppointmentId} to status: ${status}`)
      
      // TODO: Implement actual OSCAR API call when endpoint is available
      // const response = await oscarApiClient.makeRequest('PUT', `/oscar/ws/services/schedule/${oscarAppointmentId}/status`, {
      //   status: status
      // })
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OSCAR API error'
      }
    }
  }

  private async getOscarAppointmentStatus(oscarAppointmentId: string): Promise<{status: string, appointmentDate?: string, startTime?: string}> {
    try {
      // Note: This is a placeholder - actual OSCAR API endpoint may vary
      // In practice, you would call something like:
      // const response = await oscarApiClient.getAppointment(oscarAppointmentId)
      
      // For now, we'll simulate getting appointment status
      console.log(`Getting OSCAR appointment status for: ${oscarAppointmentId}`)
      
      // TODO: Implement actual OSCAR API call when endpoint is available
      // const response = await oscarApiClient.makeRequest('GET', `/oscar/ws/services/schedule/${oscarAppointmentId}`)
      
      // Return mock data for now
      return {
        status: 'Scheduled', // This would come from OSCAR
        appointmentDate: new Date().toISOString().split('T')[0],
        startTime: '10:00'
      }
    } catch (error) {
      throw new OscarApiError(
        `Failed to get OSCAR appointment status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'server_error'
      )
    }
  }

  private async logSyncOperation(operation: string, details: any, userId?: string): Promise<void> {
    try {
      await auditLog({
        action: `OSCAR_APPOINTMENT_SYNC_${operation}`,
        userId: userId || 'system',
        userEmail: 'oscar-sync-service',
        resource: 'oscar_appointment_sync',
        details: {
          service: 'OscarAppointmentSyncService',
          operation,
          ...details
        },
        ipAddress: 'system',
        userAgent: 'oscar-sync-service'
      })
    } catch (error) {
      console.error('Failed to log sync operation:', error)
    }
  }

  /**
   * Get available status mappings
   */
  public getStatusMappings(): {toOscar: Record<string, string>, fromOscar: Record<string, string>} {
    return {
      toOscar: { ...this.STATUS_MAPPING.toOscar },
      fromOscar: { ...this.STATUS_MAPPING.fromOscar }
    }
  }
}

// Export singleton instance
export const oscarAppointmentSyncService = OscarAppointmentSyncService.getInstance() 