-- Add acceptingNewPatients flag to system_settings
-- Ensures site can toggle between "Accepting New Patients" and "Join the waitlist"

ALTER TABLE "system_settings"
ADD COLUMN IF NOT EXISTS "acceptingNewPatients" BOOLEAN NOT NULL DEFAULT true;

