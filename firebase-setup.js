#!/usr/bin/env node

// Firebase Setup Helper Script
// This script helps you quickly set up Firebase for FraudSentry

console.log('🔥 FraudSentry Firebase Setup Helper');
console.log('=====================================\n');

console.log('Since Firebase requires manual setup, please follow these steps:\n');

console.log('1. 🌐 Create Firebase Project:');
console.log('   - Go to: https://console.firebase.google.com/');
console.log('   - Click "Create a project"');
console.log('   - Name: "fraudsentry-production" (or your preferred name)');
console.log('   - Disable Google Analytics (optional)\n');

console.log('2. 📱 Add Web App:');
console.log('   - In your Firebase project, click the Web icon (</>)');
console.log('   - App nickname: "FraudSentry"');
console.log('   - Do NOT enable Firebase Hosting');
console.log('   - Copy the config object\n');

console.log('3. 🗄️ Enable Firestore:');
console.log('   - Go to "Firestore Database" in the left menu');
console.log('   - Click "Create database"');
console.log('   - Choose "Start in test mode"');
console.log('   - Select a location (us-central1 recommended)\n');

console.log('4. 🔧 Update .env.local:');
console.log('   Replace the Firebase placeholders with your actual config values\n');

console.log('5. 🔄 Restart server:');
console.log('   npm run dev\n');

console.log('💡 Quick Demo Alternative:');
console.log('If you want to skip Firebase for now, we can disable velocity checks');
console.log('and use in-memory storage for demonstrations.\n');

// Check current environment
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('your-firebase-project-id')) {
    console.log('⚠️  Current status: Firebase not configured (using placeholders)');
  } else {
    console.log('✅ Current status: Firebase appears to be configured');
  }
} catch (error) {
  console.log('❌ Could not read .env.local file');
}
