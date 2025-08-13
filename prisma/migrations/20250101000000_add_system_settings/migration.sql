-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "emergencyPhone" TEXT,
    "faxNumber" TEXT,
    "adminEmail" TEXT NOT NULL,
    "businessHours" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Toronto',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "passwordExpiry" INTEGER NOT NULL DEFAULT 90,
    "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "ipWhitelist" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
