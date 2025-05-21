#!/usr/bin/env node

// This script is used in the production build process
// It generates the Prisma client and runs any necessary migrations

const { execSync } = require('child_process');
const path = require('path');

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

console.log('🚀 Starting Prisma production setup...');

// Generate Prisma client optimized for production
console.log('🔨 Generating production-ready Prisma Client...');
runCommand('npx prisma generate');

// Check if migrations need to be run
const runMigrations = process.env.RUN_MIGRATIONS === 'true';
if (runMigrations) {
  console.log('🔄 Running database migrations...');
  runCommand('npx prisma migrate deploy');
} else {
  console.log('ℹ️ Skipping database migrations (set RUN_MIGRATIONS=true to run them)');
}

// Verify database connection
console.log('🔍 Verifying database connection...');
try {
  execSync('npx prisma db pull --force-empty', { stdio: 'pipe' });
  console.log('✅ Database connection successful');
} catch (error) {
  console.error('❌ Failed to connect to the database. Check your DATABASE_URL environment variable.');
  console.error(error);
  process.exit(1);
}

console.log('✅ Prisma production setup complete!');
