#!/usr/bin/env node

/**
 * OAuth Setup Diagnostic Script
 * Checks if Google OAuth is properly configured
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Google OAuth Configuration...\n');

let hasErrors = false;

// Check 1: .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.error('   Create a .env file in the project root with:');
    console.error('   GOOGLE_CLIENT_ID=your_client_id');
    console.error('   GOOGLE_CLIENT_SECRET=your_client_secret\n');
    hasErrors = true;
} else {
    console.log('✅ .env file exists');
}

// Check 2: GOOGLE_CLIENT_ID
if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('❌ GOOGLE_CLIENT_ID not set in .env');
    hasErrors = true;
} else if (process.env.GOOGLE_CLIENT_ID.includes('your_') || process.env.GOOGLE_CLIENT_ID.includes('example')) {
    console.error('❌ GOOGLE_CLIENT_ID appears to be a placeholder');
    console.error('   Current value:', process.env.GOOGLE_CLIENT_ID);
    hasErrors = true;
} else {
    console.log('✅ GOOGLE_CLIENT_ID is set');
    console.log('   Value:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
}

// Check 3: GOOGLE_CLIENT_SECRET
if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ GOOGLE_CLIENT_SECRET not set in .env');
    hasErrors = true;
} else if (process.env.GOOGLE_CLIENT_SECRET.includes('your_') || process.env.GOOGLE_CLIENT_SECRET.includes('example')) {
    console.error('❌ GOOGLE_CLIENT_SECRET appears to be a placeholder');
    console.error('   Current value:', process.env.GOOGLE_CLIENT_SECRET);
    hasErrors = true;
} else {
    console.log('✅ GOOGLE_CLIENT_SECRET is set');
    console.log('   Value:', process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...');
}

// Check 4: PORT
if (!process.env.PORT) {
    console.warn('⚠️  PORT not set, will default to 3000');
} else {
    console.log('✅ PORT is set:', process.env.PORT);
}

// Check 5: SESSION_SECRET
if (!process.env.SESSION_SECRET) {
    console.warn('⚠️  SESSION_SECRET not set, using default (not secure for production)');
} else {
    console.log('✅ SESSION_SECRET is set');
}

// Check 6: ADMIN_EMAILS
if (!process.env.ADMIN_EMAILS) {
    console.warn('⚠️  ADMIN_EMAILS not set, no admin access will be available');
} else {
    console.log('✅ ADMIN_EMAILS is set');
    const emails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim());
    console.log('   Admin emails:', emails.join(', '));
}

// Check 7: Database
const dbPath = path.join(__dirname, '..', 'database.db');
if (!fs.existsSync(dbPath)) {
    console.warn('⚠️  database.db not found');
    console.warn('   Run: npm run init-db');
} else {
    console.log('✅ database.db exists');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.error('\n❌ Configuration errors found!');
    console.error('   Please fix the errors above before starting the server.\n');
    process.exit(1);
} else {
    console.log('\n✅ All checks passed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify redirect URI in Google Cloud Console:');
    console.log('      http://localhost:' + (process.env.PORT || 3000) + '/auth/google/callback');
    console.log('   2. Start server: npm start');
    console.log('   3. Test login: http://localhost:' + (process.env.PORT || 3000) + '\n');
    process.exit(0);
}
