-- CreateEnum
CREATE TYPE "OscarJobType" AS ENUM ('PATIENT_CREATE', 'PATIENT_UPDATE', 'PATIENT_SEARCH', 'APPOINTMENT_CREATE', 'APPOINTMENT_UPDATE', 'APPOINTMENT_CANCEL', 'APPOINTMENT_SYNC', 'PROVIDER_SYNC', 'BULK_SYNC', 'HEALTH_CHECK', 'DATA_INTEGRITY_CHECK');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'DELAYED');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "OscarErrorType" AS ENUM ('NETWORK_ERROR', 'AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR', 'VALIDATION_ERROR', 'RATE_LIMIT_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR', 'CLIENT_ERROR', 'DATA_ERROR', 'CONFIGURATION_ERROR', 'UNKNOWN_ERROR');

-- CreateEnum
CREATE TYPE "ErrorSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "oscar_job_queue" (
    "id" TEXT NOT NULL,
    "jobType" "OscarJobType" NOT NULL,
    "priority" "JobPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "error" JSONB,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "resourceType" TEXT,
    "resourceId" TEXT,
    "correlationId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oscar_job_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oscar_job_history" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "success" BOOLEAN NOT NULL,
    "result" JSONB,
    "error" JSONB,
    "errorType" "OscarErrorType",
    "executedBy" TEXT,
    "serverInfo" JSONB,

    CONSTRAINT "oscar_job_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oscar_error_log" (
    "id" TEXT NOT NULL,
    "errorType" "OscarErrorType" NOT NULL,
    "errorCode" TEXT,
    "severity" "ErrorSeverity" NOT NULL DEFAULT 'ERROR',
    "operation" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "correlationId" TEXT,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT true,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetryAt" TIMESTAMP(3),
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oscar_error_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "oscar_job_queue_status_scheduledAt_idx" ON "oscar_job_queue"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "oscar_job_queue_jobType_status_idx" ON "oscar_job_queue"("jobType", "status");

-- CreateIndex
CREATE INDEX "oscar_job_queue_resourceType_resourceId_idx" ON "oscar_job_queue"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "oscar_job_queue_nextRetryAt_idx" ON "oscar_job_queue"("nextRetryAt");

-- CreateIndex
CREATE INDEX "oscar_job_history_jobId_attemptNumber_idx" ON "oscar_job_history"("jobId", "attemptNumber");

-- CreateIndex
CREATE INDEX "oscar_job_history_startedAt_idx" ON "oscar_job_history"("startedAt");

-- CreateIndex
CREATE INDEX "oscar_error_log_errorType_severity_idx" ON "oscar_error_log"("errorType", "severity");

-- CreateIndex
CREATE INDEX "oscar_error_log_operation_createdAt_idx" ON "oscar_error_log"("operation", "createdAt");

-- CreateIndex
CREATE INDEX "oscar_error_log_resolved_severity_idx" ON "oscar_error_log"("resolved", "severity");

-- CreateIndex
CREATE INDEX "oscar_error_log_createdAt_idx" ON "oscar_error_log"("createdAt");

-- AddForeignKey
ALTER TABLE "oscar_job_history" ADD CONSTRAINT "oscar_job_history_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "oscar_job_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
