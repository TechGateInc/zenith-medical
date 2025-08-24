/*
  Warnings:

  - You are about to drop the column `oscarAppointmentId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `oscarCreatedAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `oscarLastSyncAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `oscarProviderNo` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `oscarCreatedAt` on the `patient_intakes` table. All the data in the column will be lost.
  - You are about to drop the column `oscarDemographicNo` on the `patient_intakes` table. All the data in the column will be lost.
  - You are about to drop the column `oscarLastSyncAt` on the `patient_intakes` table. All the data in the column will be lost.
  - You are about to drop the `oscar_error_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oscar_job_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oscar_job_queue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "oscar_job_history" DROP CONSTRAINT "oscar_job_history_jobId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "oscarAppointmentId",
DROP COLUMN "oscarCreatedAt",
DROP COLUMN "oscarLastSyncAt",
DROP COLUMN "oscarProviderNo";

-- AlterTable
ALTER TABLE "patient_intakes" DROP COLUMN "oscarCreatedAt",
DROP COLUMN "oscarDemographicNo",
DROP COLUMN "oscarLastSyncAt";

-- DropTable
DROP TABLE "oscar_error_log";

-- DropTable
DROP TABLE "oscar_job_history";

-- DropTable
DROP TABLE "oscar_job_queue";

-- DropEnum
DROP TYPE "OscarErrorType";

-- DropEnum
DROP TYPE "OscarJobType";
