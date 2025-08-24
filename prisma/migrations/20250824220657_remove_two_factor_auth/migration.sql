/*
  Warnings:

  - You are about to drop the column `twoFactorBackupCodes` on the `admin_users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorEnabled` on the `admin_users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `admin_users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorAuth` on the `system_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admin_users" DROP COLUMN "twoFactorBackupCodes",
DROP COLUMN "twoFactorEnabled",
DROP COLUMN "twoFactorSecret";

-- AlterTable
ALTER TABLE "system_settings" DROP COLUMN "twoFactorAuth";
