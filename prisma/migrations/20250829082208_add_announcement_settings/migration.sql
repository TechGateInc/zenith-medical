-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "announcementEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "announcementMessage" TEXT,
ADD COLUMN     "announcementTitle" TEXT,
ADD COLUMN     "announcementType" TEXT NOT NULL DEFAULT 'info';
