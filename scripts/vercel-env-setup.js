#!/usr/bin/env node

// This script ensures Prisma is properly installed on Vercel
// It's designed to be run before the postinstall script

const { execSync } = require('child_process');

console.log('🔧 Setting up Prisma for Vercel environment...');

// Make sure prisma CLI is available
try {
  console.log('📦 Installing Prisma CLI globally for Vercel environment...');
  execSync('npm install -g prisma', { stdio: 'inherit' });
  console.log('✅ Prisma CLI installed globally');
} catch (error) {
  console.error('⚠️ Could not install Prisma globally, trying to continue...');
}

// Now run the generate command
try {
  console.log('🔨 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:');
  console.error(error);
  process.exit(1);
}

console.log('✅ Prisma setup for Vercel complete!');
