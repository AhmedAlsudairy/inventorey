#!/usr/bin/env node

// This script is specifically optimized for Vercel deployment
// It generates the Prisma client during the build phase

const { execSync } = require('child_process');

/**
 * Execute a command and log its output
 * @param {string} command The command to execute
 */
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

console.log('🚀 Starting Prisma setup for Vercel deployment...');

// Generate Prisma client optimized for production
console.log('🔨 Generating production-ready Prisma Client...');
runCommand('npx prisma generate');

// Check if we need to run migrations (not typically done in Vercel builds)
// Note: Vercel recommends running migrations manually or through CI/CD pipelines
console.log('ℹ️ Note: Database migrations should be run separately before deployment');
console.log('ℹ️ You can run migrations with: npx prisma migrate deploy');

console.log('✅ Prisma Vercel setup complete!');
