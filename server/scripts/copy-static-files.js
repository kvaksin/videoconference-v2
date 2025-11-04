#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Preparing static files for production...');

// In production on Render, copy client build to server public directory
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  const serverPublicPath = path.join(__dirname, '../dist/public');

  console.log(`Checking for client build at: ${clientDistPath}`);
  
  if (fs.existsSync(clientDistPath)) {
    console.log('✅ Client build found!');
    console.log(`Creating public directory at: ${serverPublicPath}`);
    
    // Create public directory
    if (!fs.existsSync(serverPublicPath)) {
      fs.mkdirSync(serverPublicPath, { recursive: true });
    }
    
    // Copy files
    console.log('📦 Copying files...');
    try {
      execSync(`cp -r ${clientDistPath}/* ${serverPublicPath}/`, { stdio: 'inherit' });
      console.log('✅ Static files copied successfully!');
      
      // Verify
      const files = fs.readdirSync(serverPublicPath);
      console.log(`Found ${files.length} items in public directory:`, files);
      
      const indexPath = path.join(serverPublicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log('✅ index.html confirmed at:', indexPath);
      } else {
        console.error('❌ ERROR: index.html not found after copy!');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error copying files:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ ERROR: Client build not found at:', clientDistPath);
    console.log('Attempting to list parent directories...');
    try {
      console.log('Server scripts directory:', __dirname);
      console.log('Contents of ../../:', fs.readdirSync(path.join(__dirname, '../..')));
      if (fs.existsSync(path.join(__dirname, '../../client'))) {
        console.log('Contents of ../../client:', fs.readdirSync(path.join(__dirname, '../../client')));
      }
    } catch (e) {
      console.error('Could not list directories:', e.message);
    }
    console.error('⚠️  Continuing without static files - API will work but frontend won\'t be accessible');
  }
} else {
  console.log('Development mode - skipping static file copy');
}