#!/usr/bin/env node

/**
 * Interactive Environment Setup Script
 * Helps users set up their .env file step by step
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSessionSecret() {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  console.log('\n🚀 LM Mastermind - Environment Setup\n');
  console.log('This script will help you create your .env file.\n');
  console.log('Press Ctrl+C at any time to cancel.\n');

  const envPath = path.join(__dirname, '..', '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\n❌ Setup cancelled. Your existing .env file was not modified.');
      rl.close();
      return;
    }
  }

  const config = {};

  // Server Configuration
  console.log('\n📋 Step 1: Server Configuration');
  config.PORT = await question('Port (default: 3000): ') || '3000';
  config.NODE_ENV = await question('Environment (development/production) [default: development]: ') || 'development';

  // Session Secret
  console.log('\n🔐 Step 2: Session Secret');
  const generateSecret = await question('Generate a secure random session secret? (Y/n): ');
  if (generateSecret.toLowerCase() !== 'n') {
    config.SESSION_SECRET = generateSessionSecret();
    console.log(`✅ Generated secure session secret: ${config.SESSION_SECRET.substring(0, 20)}...`);
  } else {
    config.SESSION_SECRET = await question('Enter your session secret: ') || generateSessionSecret();
  }

  // Google OAuth
  console.log('\n🔑 Step 3: Google OAuth Configuration');
  console.log('You need to get these from: https://console.cloud.google.com/');
  console.log('See SETUP.md for detailed instructions.\n');
  
  config.GOOGLE_CLIENT_ID = await question('Google Client ID: ');
  config.GOOGLE_CLIENT_SECRET = await question('Google Client Secret: ');

  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    console.log('\n⚠️  Warning: Google OAuth credentials not provided. Login will not work.');
    console.log('You can add them later by editing the .env file.\n');
  }

  // Base URL
  console.log('\n🌐 Step 4: Base URL');
  if (config.NODE_ENV === 'production') {
    config.BASE_URL = await question('Production URL (e.g., https://yourdomain.com): ');
  } else {
    config.BASE_URL = await question('Base URL (default: http://localhost:3000): ') || 'http://localhost:3000';
  }

  // Admin Emails
  console.log('\n👤 Step 5: Admin Configuration');
  console.log('Enter comma-separated email addresses that should have admin access.');
  console.log('These must match the Google accounts used for login.\n');
  config.ADMIN_EMAILS = await question('Admin emails (comma-separated): ');

  if (!config.ADMIN_EMAILS) {
    console.log('\n⚠️  Warning: No admin emails provided. You can add them later.');
  }

  // Email Configuration (Optional)
  console.log('\n📧 Step 6: Email Configuration (Optional)');
  console.log('Skip this step if you don\'t need email notifications.\n');
  const setupEmail = await question('Set up email notifications? (y/N): ');
  
  if (setupEmail.toLowerCase() === 'y') {
    config.EMAIL_USER = await question('Email address: ');
    config.EMAIL_PASS = await question('App password (for Gmail, generate from Google Account settings): ');
    config.EMAIL_FROM = await question('From email address: ') || config.EMAIL_USER;
  }

  // Generate .env content
  let envContent = `# Server Configuration
PORT=${config.PORT}
NODE_ENV=${config.NODE_ENV}

# Session Secret
SESSION_SECRET=${config.SESSION_SECRET}

# Google OAuth Configuration
GOOGLE_CLIENT_ID=${config.GOOGLE_CLIENT_ID || ''}
GOOGLE_CLIENT_SECRET=${config.GOOGLE_CLIENT_SECRET || ''}

# Base URL
BASE_URL=${config.BASE_URL}

# Admin Configuration
ADMIN_EMAILS=${config.ADMIN_EMAILS || ''}
`;

  if (config.EMAIL_USER) {
    envContent += `
# Email Configuration
EMAIL_USER=${config.EMAIL_USER}
EMAIL_PASS=${config.EMAIL_PASS || ''}
EMAIL_FROM=${config.EMAIL_FROM || config.EMAIL_USER}
`;
  }

  // Write .env file
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ .env file created successfully!\n');
  console.log('📝 Next steps:');
  console.log('1. Review your .env file to ensure all values are correct');
  console.log('2. If you need Google OAuth credentials, see SETUP.md for instructions');
  console.log('3. Run: npm run init-db (to initialize the database)');
  console.log('4. Run: npm start (to start the server)\n');

  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    console.log('⚠️  Remember to add your Google OAuth credentials before testing login!\n');
  }

  rl.close();
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  rl.close();
  process.exit(1);
});

