-- AlterTable
ALTER TABLE "system_settings" ALTER COLUMN "address" SET DEFAULT 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3';

-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "credentials" TEXT,
ADD COLUMN     "education" TEXT[],
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "isDoctor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "languages" TEXT[];

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "professionalBio" TEXT NOT NULL,
    "medicalSchool" TEXT,
    "graduationYear" INTEGER,
    "residency" TEXT,
    "fellowship" TEXT,
    "boardCertifications" TEXT[],
    "hospitalAffiliations" TEXT[],
    "researchInterests" TEXT[],
    "publications" TEXT[],
    "awards" TEXT[],
    "memberships" TEXT[],
    "consultationFee" TEXT,
    "availability" TEXT,
    "emergencyContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_teamMemberId_key" ON "doctors"("teamMemberId");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
