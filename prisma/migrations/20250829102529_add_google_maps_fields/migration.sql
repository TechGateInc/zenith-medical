-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "clinicAddress" TEXT,
ADD COLUMN     "clinicLatitude" DOUBLE PRECISION,
ADD COLUMN     "clinicLongitude" DOUBLE PRECISION,
ADD COLUMN     "googleMapsApiKey" TEXT;
