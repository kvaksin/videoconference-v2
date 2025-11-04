#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get data directory from environment or use default
const dataDir = process.env.DATA_DIR || './data';

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  console.log(`Creating data directory: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
} else {
  console.log(`Data directory already exists: ${dataDir}`);
}

// Create initial data files if they don't exist
const dataFiles = [
  'users.json',
  'meetings.json',
  'availability.json',
  'meetingRequests.json',
  'availabilitySlots.json'
];

dataFiles.forEach(fileName => {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Creating initial data file: ${filePath}`);
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
});

console.log('Data directory setup complete');