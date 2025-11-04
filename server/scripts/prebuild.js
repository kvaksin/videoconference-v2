#!/usr/bin/env node

// Pre-build script to ensure TypeScript types are available
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking TypeScript build environment...');

// Check if @types/node is available
const typesNodePath = path.join(__dirname, '..', 'node_modules', '@types', 'node');
if (!fs.existsSync(typesNodePath)) {
  console.error('❌ @types/node not found. Installing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install @types/node', { stdio: 'inherit', cwd: path.dirname(__dirname) });
    console.log('✅ @types/node installed successfully');
  } catch (error) {
    console.error('❌ Failed to install @types/node:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ @types/node found');
}

// Check TypeScript compiler
try {
  require.resolve('typescript');
  console.log('✅ TypeScript compiler found');
} catch (error) {
  console.error('❌ TypeScript compiler not found');
  process.exit(1);
}

console.log('🚀 TypeScript build environment ready');