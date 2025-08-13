/*
  Warnings:

  - Added the required column `address` to the `system_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "address" TEXT NOT NULL DEFAULT 'Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3';
