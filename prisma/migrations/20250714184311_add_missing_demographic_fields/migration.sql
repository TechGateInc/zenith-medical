-- AlterTable
ALTER TABLE "patient_intakes" ADD COLUMN     "cellPhone" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "primaryLanguage" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "workPhone" TEXT;
