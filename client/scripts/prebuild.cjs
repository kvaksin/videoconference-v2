#!/usr/bin/env node

// Pre-build script to ensure React TypeScript types are available
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking React TypeScript build environment...');

// Check if @types/react is available
const typesReactPath = path.join(__dirname, '..', 'node_modules', '@types', 'react');
if (!fs.existsSync(typesReactPath)) {
  console.error('❌ @types/react not found. Installing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install @types/react @types/react-dom', { stdio: 'inherit', cwd: path.dirname(__dirname) });
    console.log('✅ React types installed successfully');
  } catch (error) {
    console.error('❌ Failed to install React types:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ @types/react found');
}

// Check if @types/react-dom is available
const typesReactDomPath = path.join(__dirname, '..', 'node_modules', '@types', 'react-dom');
if (!fs.existsSync(typesReactDomPath)) {
  console.error('❌ @types/react-dom not found');
  process.exit(1);
} else {
  console.log('✅ @types/react-dom found');
}

// Check TypeScript compiler
try {
  require.resolve('typescript');
  console.log('✅ TypeScript compiler found');
} catch (error) {
  console.error('❌ TypeScript compiler not found');
  process.exit(1);
}

// Check Vite
try {
  require.resolve('vite');
  console.log('✅ Vite bundler found');
} catch (error) {
  console.error('❌ Vite bundler not found');
  process.exit(1);
}

console.log('🚀 React TypeScript build environment ready');