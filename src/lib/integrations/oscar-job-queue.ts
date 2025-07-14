import { prisma } from '../prisma'
import { auditLog } from '../audit/audit-logger'
import { 
  OscarError, 
  OscarAuthenticationError, 
  OscarNetworkError, 
  OscarApiError, 
  OscarConfigurationError, 
  OscarDataError 
} from './oscar-errors'
import type { 
  OscarJobType, 
  JobStatus, 
  JobPriority, 
  OscarErrorType, 
  ErrorSeverity 
} from '@prisma/client'

export interface JobPayload {
  [key: string]: any
}

export interface QueueJobOptions {
  priority?: JobPriority
  maxAttempts?: number
  delay?: number // milliseconds
  correlationId?: string
  resourceType?: string
  resourceId?: string
  createdBy?: string
}

export interface JobResult {
  success: boolean
  data?: any
  error?: string
  metadata?: Record<string, any>
}

export interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  delayed: number
  total: number
}

export interface RetryConfig {
  baseDelay: number // milliseconds
  maxDelay: number // milliseconds
  backoffMultiplier: number
  jitter: boolean
}

export class OscarJobQueue {
  private static instance: OscarJobQueue
  private isProcessing: boolean = false
  private processInterval: NodeJS.Timeout | null = null
  private readonly PROCESS_INTERVAL_MS = 5000 // Check for jobs every 5 seconds
  
  // Default retry configuration
  private readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    baseDelay: 1000, // 1 second
    maxDelay: 300000, // 5 minutes
    backoffMultiplier: 2,
    jitter: true
  }

  // Job type configurations
  private readonly JOB_CONFIGS: Record<OscarJobType, { maxAttempts: number, priority: JobPriority }> = {
    PATIENT_CREATE: { maxAttempts: 5, priority: 'HIGH' },
    PATIENT_UPDATE: { maxAttempts: 3, priority: 'NORMAL' },
    PATIENT_SEARCH: { maxAttempts: 2, priority: 'LOW' },
    APPOINTMENT_CREATE: { maxAttempts: 5, priority: 'HIGH' },
    APPOINTMENT_UPDATE: { maxAttempts: 3, priority: 'NORMAL' },
    APPOINTMENT_CANCEL: { maxAttempts: 3, priority: 'HIGH' },
    APPOINTMENT_SYNC: { maxAttempts: 2, priority: 'LOW' },
    PROVIDER_SYNC: { maxAttempts: 2, priority: 'LOW' },
    BULK_SYNC: { maxAttempts: 1, priority: 'LOW' },
    HEALTH_CHECK: { maxAttempts: 1, priority: 'LOW' },
    DATA_INTEGRITY_CHECK: { maxAttempts: 1, priority: 'LOW' }
  }

  constructor() {
    // Singleton pattern
  }

  public static getInstance(): OscarJobQueue {
    if (!OscarJobQueue.instance) {
      OscarJobQueue.instance = new OscarJobQueue()
    }
    return OscarJobQueue.instance
  }

  /**
   * Add a job to the queue
   */
  public async addJob(
    jobType: OscarJobType,
    payload: JobPayload,
    options: QueueJobOptions = {}
  ): Promise<string> {
    try {
      const config = this.JOB_CONFIGS[jobType]
      
      const job = await prisma.oscarJobQueue.create({
        data: {
          jobType,
          payload,
          priority: options.priority || config.priority,
          maxAttempts: options.maxAttempts || config.maxAttempts,
          scheduledAt: options.delay ? new Date(Date.now() + options.delay) : new Date(),
          status: options.delay ? 'DELAYED' : 'PENDING',
          correlationId: options.correlationId,
          resourceType: options.resourceType,
          resourceId: options.resourceId,
          createdBy: options.createdBy
        }
      })

      await this.logOperation('JOB_QUEUED', {
        jobId: job.id,
        jobType,
        priority: job.priority,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        delay: options.delay
      })

      return job.id
    } catch (error) {
      await this.logOperation('JOB_QUEUE_ERROR', {
        jobType,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Start the job processor
   */
  public startProcessor(): void {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true
    this.processInterval = setInterval(async () => {
      try {
        await this.processJobs()
      } catch (error) {
        console.error('Job processor error:', error)
        await this.logOperation('PROCESSOR_ERROR', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }, this.PROCESS_INTERVAL_MS)

    console.log('OSCAR job processor started')
  }

  /**
   * Stop the job processor
   */
  public stopProcessor(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval)
      this.processInterval = null
    }
    this.isProcessing = false
    console.log('OSCAR job processor stopped')
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    // Move delayed jobs to pending if their time has come
    await this.activateDelayedJobs()

    // Get pending jobs ordered by priority and creation time
    const jobs = await prisma.oscarJobQueue.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: new Date() } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' }
      ],
      take: 10 // Process up to 10 jobs at once
    })

    for (const job of jobs) {
      try {
        await this.processJob(job.id)
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error)
      }
    }
  }

  /**
   * Move delayed jobs to pending status when their time comes
   */
  private async activateDelayedJobs(): Promise<void> {
    await prisma.oscarJobQueue.updateMany({
      where: {
        status: 'DELAYED',
        scheduledAt: { lte: new Date() }
      },
      data: {
        status: 'PENDING'
      }
    })
  }

  /**
   * Process a single job
   */
  private async processJob(jobId: string): Promise<void> {
    const startTime = Date.now()
    
    // Mark job as processing
    const job = await prisma.oscarJobQueue.update({
      where: { id: jobId },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
        attemptCount: { increment: 1 }
      }
    })

    try {
      // Execute the job
      const result = await this.executeJob(job.jobType, job.payload)
      
      // Job succeeded
      await this.completeJob(jobId, result, Date.now() - startTime)
      
    } catch (error) {
      // Job failed
      await this.handleJobFailure(jobId, error, Date.now() - startTime)
    }
  }

  /**
   * Execute a job based on its type
   */
  private async executeJob(jobType: OscarJobType, payload: JobPayload): Promise<JobResult> {
    // Import services dynamically to avoid circular dependencies
    const { oscarPatientService } = await import('./oscar-patient-service')
    const { oscarAppointmentService } = await import('./oscar-appointment-service')
    const { oscarAppointmentSyncService } = await import('./oscar-appointment-sync')
    const { oscarApiClient } = await import('./oscar-api')

    switch (jobType) {
      case 'PATIENT_CREATE':
        return await this.executePatientCreate(oscarPatientService, payload)
      
      case 'PATIENT_UPDATE':
        return await this.executePatientUpdate(oscarPatientService, payload)
      
      case 'PATIENT_SEARCH':
        return await this.executePatientSearch(oscarPatientService, payload)
      
      case 'APPOINTMENT_CREATE':
        return await this.executeAppointmentCreate(oscarAppointmentService, payload)
      
      case 'APPOINTMENT_UPDATE':
        return await this.executeAppointmentUpdate(oscarAppointmentService, payload)
      
      case 'APPOINTMENT_CANCEL':
        return await this.executeAppointmentCancel(oscarAppointmentService, payload)
      
      case 'APPOINTMENT_SYNC':
        return await this.executeAppointmentSync(oscarAppointmentSyncService, payload)
      
      case 'PROVIDER_SYNC':
        return await this.executeProviderSync(oscarAppointmentService, payload)
      
      case 'BULK_SYNC':
        return await this.executeBulkSync(oscarAppointmentSyncService, payload)
      
      case 'HEALTH_CHECK':
        return await this.executeHealthCheck(oscarApiClient, payload)
      
      case 'DATA_INTEGRITY_CHECK':
        return await this.executeDataIntegrityCheck(payload)
      
      default:
        throw new OscarError(`Unknown job type: ${jobType}`)
    }
  }

  /**
   * Job execution methods
   */
  private async executePatientCreate(service: any, payload: JobPayload): Promise<JobResult> {
    const result = await service.createPatientFromIntake(payload.patientIntake)
    return {
      success: result.success,
      data: result,
      error: result.success ? undefined : result.error
    }
  }

  private async executePatientUpdate(service: any, payload: JobPayload): Promise<JobResult> {
    // Implementation for patient update
    throw new OscarError('Patient update not yet implemented')
  }

  private async executePatientSearch(service: any, payload: JobPayload): Promise<JobResult> {
    const result = await service.searchPatientByHealthNumber(payload.healthNumber)
    return {
      success: result.success,
      data: result,
      error: result.success ? undefined : result.error
    }
  }

  private async executeAppointmentCreate(service: any, payload: JobPayload): Promise<JobResult> {
    const result = await service.createAppointment(payload.appointmentRequest)
    return {
      success: result.success,
      data: result,
      error: result.success ? undefined : result.error
    }
  }

  private async executeAppointmentUpdate(service: any, payload: JobPayload): Promise<JobResult> {
    // Implementation for appointment update
    throw new OscarError('Appointment update not yet implemented')
  }

  private async executeAppointmentCancel(service: any, payload: JobPayload): Promise<JobResult> {
    // Implementation for appointment cancellation
    throw new OscarError('Appointment cancellation not yet implemented')
  }

  private async executeAppointmentSync(service: any, payload: JobPayload): Promise<JobResult> {
    const result = await service.syncFromOscar(payload.appointmentId, payload.userId)
    return {
      success: result.success,
      data: result,
      error: result.success ? undefined : result.error
    }
  }

  private async executeProviderSync(service: any, payload: JobPayload): Promise<JobResult> {
    const providers = await service.getProviders(true) // Force refresh
    return {
      success: true,
      data: { providersCount: providers.length },
      metadata: { forceRefresh: true }
    }
  }

  private async executeBulkSync(service: any, payload: JobPayload): Promise<JobResult> {
    const result = await service.bulkSyncAppointments(
      payload.appointmentIds,
      payload.direction,
      payload.userId
    )
    return {
      success: result.successful > 0,
      data: result,
      error: result.errors.length > 0 ? result.errors.join('; ') : undefined
    }
  }

  private async executeHealthCheck(client: any, payload: JobPayload): Promise<JobResult> {
    const result = await client.testConnection()
    return {
      success: result.success,
      data: result,
      error: result.success ? undefined : result.error
    }
  }

  private async executeDataIntegrityCheck(payload: JobPayload): Promise<JobResult> {
    // Check for orphaned records, inconsistent data, etc.
    const checks = []
    
    // Check for appointments without OSCAR IDs that should have them
    const orphanedAppointments = await prisma.appointment.count({
      where: {
        providerType: 'oscar',
        oscarAppointmentId: null
      }
    })
    
    if (orphanedAppointments > 0) {
      checks.push(`${orphanedAppointments} OSCAR appointments without appointment IDs`)
    }

    // Check for patients without demographic numbers
    const orphanedPatients = await prisma.patientIntake.count({
      where: {
        oscarDemographicNo: null,
        status: 'APPOINTMENT_SCHEDULED'
      }
    })
    
    if (orphanedPatients > 0) {
      checks.push(`${orphanedPatients} scheduled patients without demographic numbers`)
    }

    return {
      success: checks.length === 0,
      data: { issues: checks, timestamp: new Date() },
      error: checks.length > 0 ? `Found ${checks.length} integrity issues` : undefined
    }
  }

  /**
   * Complete a successful job
   */
  private async completeJob(jobId: string, result: JobResult, duration: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update job status
      await tx.oscarJobQueue.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          result: result.data
        }
      })

      // Create history record
      const job = await tx.oscarJobQueue.findUnique({ where: { id: jobId } })
      if (job) {
        await tx.oscarJobHistory.create({
          data: {
            jobId,
            attemptNumber: job.attemptCount,
            status: 'COMPLETED',
            startedAt: job.startedAt!,
            completedAt: new Date(),
            duration,
            success: true,
            result: result.data,
            executedBy: 'oscar-job-queue'
          }
        })
      }
    })

    await this.logOperation('JOB_COMPLETED', {
      jobId,
      duration,
      success: true
    })
  }

  /**
   * Handle job failure with retry logic
   */
  private async handleJobFailure(jobId: string, error: any, duration: number): Promise<void> {
    const job = await prisma.oscarJobQueue.findUnique({ where: { id: jobId } })
    if (!job) return

    const errorType = this.classifyError(error)
    const shouldRetry = this.shouldRetry(error, job.attemptCount, job.maxAttempts)
    
    // Log error
    await this.logError(error, {
      operation: `job_${job.jobType.toLowerCase()}`,
      resourceType: job.resourceType,
      resourceId: job.resourceId,
      correlationId: job.correlationId,
      jobId,
      attemptNumber: job.attemptCount
    })

    if (shouldRetry) {
      // Calculate next retry time with exponential backoff
      const nextRetryAt = this.calculateNextRetryTime(job.attemptCount)
      
      await prisma.$transaction(async (tx) => {
        // Update job for retry
        await tx.oscarJobQueue.update({
          where: { id: jobId },
          data: {
            status: 'PENDING',
            nextRetryAt,
            error: {
              message: error instanceof Error ? error.message : String(error),
              type: errorType,
              timestamp: new Date()
            }
          }
        })

        // Create history record
        await tx.oscarJobHistory.create({
          data: {
            jobId,
            attemptNumber: job.attemptCount,
            status: 'FAILED',
            startedAt: job.startedAt!,
            completedAt: new Date(),
            duration,
            success: false,
            error: {
              message: error instanceof Error ? error.message : String(error),
              type: errorType,
              stack: error instanceof Error ? error.stack : undefined
            },
            errorType,
            executedBy: 'oscar-job-queue'
          }
        })
      })

      await this.logOperation('JOB_RETRY_SCHEDULED', {
        jobId,
        attemptNumber: job.attemptCount,
        nextRetryAt,
        errorType
      })
    } else {
      // Job failed permanently
      await prisma.$transaction(async (tx) => {
        await tx.oscarJobQueue.update({
          where: { id: jobId },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            error: {
              message: error instanceof Error ? error.message : String(error),
              type: errorType,
              timestamp: new Date(),
              final: true
            }
          }
        })

        // Create final history record
        await tx.oscarJobHistory.create({
          data: {
            jobId,
            attemptNumber: job.attemptCount,
            status: 'FAILED',
            startedAt: job.startedAt!,
            completedAt: new Date(),
            duration,
            success: false,
            error: {
              message: error instanceof Error ? error.message : String(error),
              type: errorType,
              stack: error instanceof Error ? error.stack : undefined,
              final: true
            },
            errorType,
            executedBy: 'oscar-job-queue'
          }
        })
      })

      await this.logOperation('JOB_FAILED_PERMANENTLY', {
        jobId,
        totalAttempts: job.attemptCount,
        errorType
      })
    }
  }

  /**
   * Classify error type for better handling
   */
  private classifyError(error: any): OscarErrorType {
    if (error instanceof OscarAuthenticationError) {
      return 'AUTHENTICATION_ERROR'
    }
    if (error instanceof OscarNetworkError) {
      return 'NETWORK_ERROR'
    }
    if (error instanceof OscarApiError) {
      if (error.statusCode === 429) {
        return 'RATE_LIMIT_ERROR'
      }
      if (error.statusCode >= 500) {
        return 'SERVER_ERROR'
      }
      if (error.statusCode >= 400) {
        return 'CLIENT_ERROR'
      }
      return 'SERVER_ERROR'
    }
    if (error instanceof OscarDataError) {
      return 'DATA_ERROR'
    }
    if (error instanceof OscarConfigurationError) {
      return 'CONFIGURATION_ERROR'
    }
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return 'NETWORK_ERROR'
    }
    if (error?.code === 'ETIMEDOUT') {
      return 'TIMEOUT_ERROR'
    }
    return 'UNKNOWN_ERROR'
  }

  /**
   * Determine if a job should be retried
   */
  private shouldRetry(error: any, attemptCount: number, maxAttempts: number): boolean {
    if (attemptCount >= maxAttempts) {
      return false
    }

    const errorType = this.classifyError(error)
    
    // Don't retry certain error types
    const nonRetryableErrors: OscarErrorType[] = [
      'AUTHENTICATION_ERROR',
      'AUTHORIZATION_ERROR',
      'VALIDATION_ERROR',
      'DATA_ERROR',
      'CONFIGURATION_ERROR'
    ]
    
    return !nonRetryableErrors.includes(errorType)
  }

  /**
   * Calculate next retry time with exponential backoff
   */
  private calculateNextRetryTime(attemptCount: number): Date {
    const config = this.DEFAULT_RETRY_CONFIG
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attemptCount - 1)
    
    // Apply max delay limit
    delay = Math.min(delay, config.maxDelay)
    
    // Add jitter to avoid thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }
    
    return new Date(Date.now() + delay)
  }

  /**
   * Log error to the error log table
   */
  private async logError(error: any, context: {
    operation: string
    resourceType?: string
    resourceId?: string
    correlationId?: string
    jobId?: string
    attemptNumber?: number
  }): Promise<void> {
    try {
      const errorType = this.classifyError(error)
      const severity = this.getErrorSeverity(errorType)
      
      await prisma.oscarErrorLog.create({
        data: {
          errorType,
          severity,
          operation: context.operation,
          resourceType: context.resourceType,
          resourceId: context.resourceId,
          correlationId: context.correlationId,
          message: error instanceof Error ? error.message : String(error),
          details: {
            stack: error instanceof Error ? error.stack : undefined,
            jobId: context.jobId,
            attemptNumber: context.attemptNumber,
            timestamp: new Date()
          },
          retryable: this.shouldRetry(error, context.attemptNumber || 1, 3)
        }
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  /**
   * Get error severity based on error type
   */
  private getErrorSeverity(errorType: OscarErrorType): ErrorSeverity {
    const severityMap: Record<OscarErrorType, ErrorSeverity> = {
      'AUTHENTICATION_ERROR': 'CRITICAL',
      'AUTHORIZATION_ERROR': 'CRITICAL',
      'CONFIGURATION_ERROR': 'CRITICAL',
      'NETWORK_ERROR': 'ERROR',
      'TIMEOUT_ERROR': 'ERROR',
      'SERVER_ERROR': 'ERROR',
      'RATE_LIMIT_ERROR': 'WARNING',
      'CLIENT_ERROR': 'WARNING',
      'VALIDATION_ERROR': 'WARNING',
      'DATA_ERROR': 'ERROR',
      'UNKNOWN_ERROR': 'ERROR'
    }
    
    return severityMap[errorType] || 'ERROR'
  }

  /**
   * Get queue statistics
   */
  public async getQueueStats(): Promise<QueueStats> {
    const stats = await prisma.oscarJobQueue.groupBy({
      by: ['status'],
      _count: true
    })

    const result: QueueStats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0
    }

    for (const stat of stats) {
      const count = stat._count
      result.total += count
      
      switch (stat.status) {
        case 'PENDING':
          result.pending = count
          break
        case 'PROCESSING':
          result.processing = count
          break
        case 'COMPLETED':
          result.completed = count
          break
        case 'FAILED':
          result.failed = count
          break
        case 'DELAYED':
          result.delayed = count
          break
      }
    }

    return result
  }

  /**
   * Cancel a job
   */
  public async cancelJob(jobId: string, reason?: string): Promise<boolean> {
    try {
      const job = await prisma.oscarJobQueue.findUnique({ where: { id: jobId } })
      if (!job) {
        return false
      }

      if (job.status === 'PROCESSING') {
        // Can't cancel a job that's currently processing
        return false
      }

      await prisma.oscarJobQueue.update({
        where: { id: jobId },
        data: {
          status: 'CANCELLED',
          completedAt: new Date(),
          error: {
            message: reason || 'Job cancelled manually',
            type: 'CANCELLED',
            timestamp: new Date()
          }
        }
      })

      await this.logOperation('JOB_CANCELLED', {
        jobId,
        reason: reason || 'Manual cancellation'
      })

      return true
    } catch (error) {
      await this.logOperation('JOB_CANCEL_ERROR', {
        jobId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Retry a failed job
   */
  public async retryJob(jobId: string): Promise<boolean> {
    try {
      const job = await prisma.oscarJobQueue.findUnique({ where: { id: jobId } })
      if (!job || job.status !== 'FAILED') {
        return false
      }

      await prisma.oscarJobQueue.update({
        where: { id: jobId },
        data: {
          status: 'PENDING',
          nextRetryAt: new Date(),
          error: null,
          attemptCount: 0 // Reset attempt count for manual retry
        }
      })

      await this.logOperation('JOB_MANUAL_RETRY', {
        jobId
      })

      return true
    } catch (error) {
      await this.logOperation('JOB_RETRY_ERROR', {
        jobId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Get job details
   */
  public async getJob(jobId: string) {
    return await prisma.oscarJobQueue.findUnique({
      where: { id: jobId },
      include: {
        jobHistory: {
          orderBy: { attemptNumber: 'desc' }
        }
      }
    })
  }

  /**
   * Get jobs with filtering
   */
  public async getJobs(filters: {
    status?: JobStatus[]
    jobType?: OscarJobType[]
    resourceType?: string
    resourceId?: string
    correlationId?: string
    limit?: number
    offset?: number
  } = {}) {
    const where: any = {}
    
    if (filters.status) {
      where.status = { in: filters.status }
    }
    if (filters.jobType) {
      where.jobType = { in: filters.jobType }
    }
    if (filters.resourceType) {
      where.resourceType = filters.resourceType
    }
    if (filters.resourceId) {
      where.resourceId = filters.resourceId
    }
    if (filters.correlationId) {
      where.correlationId = filters.correlationId
    }

    return await prisma.oscarJobQueue.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: filters.limit || 50,
      skip: filters.offset || 0
    })
  }

  /**
   * Clean up old completed jobs
   */
  public async cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    
    const result = await prisma.oscarJobQueue.deleteMany({
      where: {
        status: 'COMPLETED',
        completedAt: { lt: cutoffDate }
      }
    })

    await this.logOperation('JOBS_CLEANUP', {
      deletedCount: result.count,
      olderThanDays
    })

    return result.count
  }

  /**
   * Log operation for audit trail
   */
  private async logOperation(operation: string, details: any): Promise<void> {
    try {
      await auditLog({
        action: `OSCAR_JOB_QUEUE_${operation}`,
        userId: 'system',
        userEmail: 'oscar-job-queue',
        resource: 'oscar_job_queue',
        details: {
          service: 'OscarJobQueue',
          operation,
          ...details
        },
        ipAddress: 'system',
        userAgent: 'oscar-job-queue'
      })
    } catch (error) {
      console.error('Failed to log operation:', error)
    }
  }
}

// Export singleton instance
export const oscarJobQueue = OscarJobQueue.getInstance() 