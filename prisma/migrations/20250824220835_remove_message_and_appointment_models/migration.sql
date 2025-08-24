/*
  Warnings:

  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patientIntakeId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_patientIntakeId_fkey";

-- DropTable
DROP TABLE "appointments";

-- DropTable
DROP TABLE "messages";

-- DropEnum
DROP TYPE "SenderType";
