#!/usr/bin/env node

/**
 * Seed System Settings
 * Creates default system settings in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultSettings = {
  id: 'default-settings',
  primaryPhone: '249 806 0128',
  emergencyPhone: null,
  faxNumber: null,
  adminEmail: 'admin@zenithmedical.ca',
  businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
  timezone: 'America/Toronto',
  dateFormat: 'MM/DD/YYYY',
  emailNotifications: true,
  appointmentReminders: true,
  securityAlerts: true,
  maintenanceMode: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordExpiry: 90,

  ipWhitelist: null,
  updatedBy: null
};

async function seedSettings() {
  try {
    console.log('🌱 Seeding system settings...');

    // Check if settings already exist
    const existingSettings = await prisma.systemSettings.findFirst({
      where: { id: 'default-settings' }
    });

    if (existingSettings) {
      console.log('✅ Settings already exist, updating with current defaults...');
      
      const updatedSettings = await prisma.systemSettings.update({
        where: { id: 'default-settings' },
        data: {
          ...defaultSettings,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Settings updated successfully!');
      console.log('📞 Primary Phone:', updatedSettings.primaryPhone);
      console.log('📧 Admin Email:', updatedSettings.adminEmail);
      console.log('🕒 Business Hours:', updatedSettings.businessHours);
    } else {
      console.log('📝 Creating new default settings...');
      
      const newSettings = await prisma.systemSettings.create({
        data: defaultSettings
      });
      
      console.log('✅ Settings created successfully!');
      console.log('📞 Primary Phone:', newSettings.primaryPhone);
      console.log('📧 Admin Email:', newSettings.adminEmail);
      console.log('🕒 Business Hours:', newSettings.businessHours);
    }

    console.log('\n🎉 System settings seeding completed!');
    console.log('\nYou can now:');
    console.log('1. Access admin settings at /admin/settings');
    console.log('2. Modify the phone number and other settings');
    console.log('3. Changes will be reflected across the entire application');

  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedSettings();
