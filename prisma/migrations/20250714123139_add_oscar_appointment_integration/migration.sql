-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "oscarAppointmentId" TEXT,
ADD COLUMN     "oscarCreatedAt" TIMESTAMP(3),
ADD COLUMN     "oscarLastSyncAt" TIMESTAMP(3),
ADD COLUMN     "oscarProviderNo" TEXT;
