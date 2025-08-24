/*
  Warnings:

  - You are about to drop the column `appointmentReminders` on the `system_settings` table. All the data in the column will be lost.
  - You are about to drop the column `contactFormEnabled` on the `system_settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `system_settings` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceMode` on the `system_settings` table. All the data in the column will be lost.
  - You are about to drop the column `securityAlerts` on the `system_settings` table. All the data in the column will be lost.
  - You are about to drop the `notification_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "system_settings" DROP COLUMN "appointmentReminders",
DROP COLUMN "contactFormEnabled",
DROP COLUMN "emailNotifications",
DROP COLUMN "maintenanceMode",
DROP COLUMN "securityAlerts";

-- DropTable
DROP TABLE "notification_templates";

-- DropEnum
DROP TYPE "NotificationMethod";

-- DropEnum
DROP TYPE "NotificationType";
