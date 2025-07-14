-- AlterTable
ALTER TABLE "patient_intakes" ADD COLUMN     "oscarCreatedAt" TIMESTAMP(3),
ADD COLUMN     "oscarDemographicNo" TEXT,
ADD COLUMN     "oscarLastSyncAt" TIMESTAMP(3);
