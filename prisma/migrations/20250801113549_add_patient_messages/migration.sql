-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('PATIENT', 'ADMIN');

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "patientIntakeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "subject" TEXT,
    "senderType" "SenderType" NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "adminUserId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependents" (
    "id" TEXT NOT NULL,
    "patientIntakeId" TEXT NOT NULL,
    "legalFirstName" TEXT NOT NULL,
    "legalLastName" TEXT NOT NULL,
    "healthInformationNumber" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "residenceAddressSameAsSection1" BOOLEAN NOT NULL,
    "residenceApartmentNumber" TEXT NOT NULL,
    "residenceStreetAddress" TEXT NOT NULL,
    "residenceCity" TEXT NOT NULL,
    "residencePostalCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dependents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_patientIntakeId_fkey" FOREIGN KEY ("patientIntakeId") REFERENCES "patient_intakes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependents" ADD CONSTRAINT "dependents_patientIntakeId_fkey" FOREIGN KEY ("patientIntakeId") REFERENCES "patient_intakes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
