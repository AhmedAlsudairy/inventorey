#!/usr/bin/env node

// This script adds a .npmrc file that instructs npm to ignore peer dependency conflicts
// Specifically required for React 19 compatibility with packages that only support React 18

const fs = require('fs');
const path = require('path');

// Create or update .npmrc file
const npmrcPath = path.join(process.cwd(), '.npmrc');
const npmrcContent = 'legacy-peer-deps=true\nstrict-peer-dependencies=false\n';

try {
  fs.writeFileSync(npmrcPath, npmrcContent);
  console.log('✅ Created .npmrc file to handle React version compatibility');
} catch (error) {
  console.error('❌ Failed to create .npmrc file:', error);
  process.exit(1);
}
