#!/usr/bin/env node

/**
 * Create Initial Admin User for Zenith Medical Centre
 * Run this script once to set up the first admin user
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createInitialAdmin() {
  console.log('🏥 Zenith Medical Centre - Admin User Setup\n');

  try {
    // Check if any admin users already exist
    const existingAdmin = await prisma.adminUser.findFirst();
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists in the system.');
      console.log(`Existing admin: ${existingAdmin.email} (${existingAdmin.role})\n`);
      
      const overwrite = await question('Do you want to create another admin user? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        return;
      }
    }

    // Collect admin user details
    console.log('Creating new admin user...\n');
    
    const name = await question('Admin Name: ');
    if (!name.trim()) {
      throw new Error('Name is required');
    }

    const email = await question('Admin Email: ');
    if (!email.trim() || !email.includes('@')) {
      throw new Error('Valid email is required');
    }

    // Check if email already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('An admin user with this email already exists');
    }

    const password = await question('Admin Password (min 8 characters): ');
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    console.log('\nSelect admin role:');
    console.log('1. EDITOR - Can manage content (blog posts, FAQs, team profiles)');
    console.log('2. ADMIN - Can manage content and patient intake data');
    console.log('3. SUPER_ADMIN - Full system access including user management');
    
    const roleChoice = await question('Choice (1-3): ');
    
    let role;
    switch (roleChoice) {
      case '1':
        role = 'EDITOR';
        break;
      case '2':
        role = 'ADMIN';
        break;
      case '3':
        role = 'SUPER_ADMIN';
        break;
      default:
        role = 'ADMIN'; // Default to ADMIN
        console.log('Invalid choice, defaulting to ADMIN role');
    }

    // Hash password
    console.log('\nCreating admin user...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        name: name.trim(),
        role: role
      }
    });

    // Log the creation in audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'CREATE',
        resource: 'admin_user',
        resourceId: adminUser.id,
        details: {
          createdBy: 'system_script',
          role: role
        }
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`ID: ${adminUser.id}\n`);

    console.log('🔐 Security recommendations:');
    console.log('- Change the default password after first login');
    console.log('- Enable two-factor authentication if available');
    console.log('- Regularly review admin user access');
    console.log('- Monitor audit logs for suspicious activity\n');

    console.log('🚀 You can now log in at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Handle script execution
if (require.main === module) {
  createInitialAdmin()
    .catch(console.error)
    .finally(() => process.exit());
}

module.exports = { createInitialAdmin }; 