#!/usr/bin/env node

/**
 * Environment Setup Script for Zenith Medical Centre
 * Generates encryption keys and displays required environment variables
 */

const crypto = require('crypto');

console.log('🏥 Zenith Medical Centre - Environment Setup\n');

// Generate secure encryption keys
const encryptionKey = crypto.randomBytes(32).toString('hex');
const encryptionIV = crypto.randomBytes(16).toString('hex');
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

console.log('Generated secure encryption keys:\n');

console.log('📋 Copy the following to your .env file:\n');
console.log('# Database Configuration');
console.log('DATABASE_URL="postgresql://username:password@localhost:5432/zenith_medical_db?schema=public"');
console.log('');
console.log('# Encryption Configuration (AES-256 for PHI data)');
console.log(`ENCRYPTION_KEY="${encryptionKey}"`);
console.log(`ENCRYPTION_IV="${encryptionIV}"`);
console.log('');
console.log('# NextAuth Configuration');
console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"`);
console.log('NEXTAUTH_URL="http://localhost:3000"');
console.log('');
console.log('# Email Configuration (for notifications)');
console.log('EMAIL_SERVER_HOST="smtp.gmail.com"');
console.log('EMAIL_SERVER_PORT="587"');
console.log('EMAIL_SERVER_USER="your-email@example.com"');
console.log('EMAIL_SERVER_PASSWORD="your-app-password"');
console.log('EMAIL_FROM="noreply@zenithmedical.ca"');
console.log('');
console.log('# SMS Configuration (Twilio)');
console.log('TWILIO_ACCOUNT_SID="your-twilio-account-sid"');
console.log('TWILIO_AUTH_TOKEN="your-twilio-auth-token"');
console.log('TWILIO_PHONE_NUMBER="+1234567890"');
console.log('');
console.log('# Admin Configuration');
console.log('ADMIN_EMAIL="admin@zenithmedical.ca"');
console.log('ADMIN_PASSWORD="secure-admin-password"');
console.log('');
console.log('# Third-party Appointment Booking');
console.log('APPOINTMENT_BOOKING_URL="https://your-booking-system.com"');
console.log('');
console.log('# Development/Production Environment');
console.log('NODE_ENV="development"');
console.log('\n');

console.log('🔐 Security Notes:');
console.log('- Store these keys securely and never commit them to version control');
console.log('- The encryption keys are used for HIPAA/PIPEDA compliant PHI data protection');
console.log('- Change ADMIN_PASSWORD to a strong, unique password');
console.log('- Configure proper PostgreSQL database connection');
console.log('\n');

console.log('📊 Next Steps:');
console.log('1. Create a .env file in the project root');
console.log('2. Copy the environment variables above into the .env file');
console.log('3. Set up PostgreSQL database');
console.log('4. Run: bun run prisma db push (to create tables)');
console.log('5. Run: bun run dev (to start the development server)');
console.log('\n✨ Setup complete!'); 