#!/usr/bin/env node

/**
 * Oscar EMR OAuth Setup Helper
 * Quick script to get OAuth tokens manually
 */

const readline = require('readline');
const https = require('https');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupOscarOAuth() {
  console.log('🏥 Oscar EMR OAuth Setup Helper\n');
  
  try {
    // Get credentials from user
    const baseUrl = await question('Enter Oscar EMR Base URL (e.g., https://your-oscar.com): ');
    const consumerKey = await question('Enter Consumer Key: ');
    const consumerSecret = await question('Enter Consumer Secret: ');
    
    console.log('\n📝 Setting up OAuth 1.0a flow...\n');
    
    // Generate environment template
    const envTemplate = `
# Oscar EMR Integration Credentials
OSCAR_BASE_URL=${baseUrl}
OSCAR_CONSUMER_KEY=${consumerKey}
OSCAR_CONSUMER_SECRET=${consumerSecret}
OSCAR_TOKEN=your-access-token-here
OSCAR_TOKEN_SECRET=your-access-token-secret-here
`;
    
    console.log('✅ Environment template generated!\n');
    console.log('📋 Add these to your .env file:');
    console.log('=' * 50);
    console.log(envTemplate);
    console.log('=' * 50);
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Add the above credentials to your .env file');
    console.log('2. Navigate to: http://localhost:3000/admin/oscar/oauth');
    console.log('3. Complete the OAuth flow to get access tokens');
    console.log('4. Replace OSCAR_TOKEN and OSCAR_TOKEN_SECRET with real values');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  setupOscarOAuth();
}

module.exports = { setupOscarOAuth }; 