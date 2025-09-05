#!/usr/bin/env node

/**
 * Script to check and update expired offers
 * This script can be run manually or scheduled via cron
 * 
 * Usage:
 * - Manual: node scripts/check-expired-offers.js
 * - Cron: Add to crontab to run daily at 12:05 AM: 5 0 * * * cd /path/to/cityshopping-backend && node scripts/check-expired-offers.js
 * 
 * Note: Since offers expire at midnight, running this daily at 12:05 AM is sufficient.
 * The backend also has a built-in scheduled job that runs daily at 12:05 AM.
 */

const { execSync } = require('child_process');
const path = require('path');

async function checkExpiredOffers() {
  try {
    console.log('🕐 Starting expired offers check...');
    console.log('📅 Current time:', new Date().toISOString());
    
    // Get the backend directory path
    const backendDir = path.resolve(__dirname, '..');
    
    // Change to backend directory
    process.chdir(backendDir);
    
    // Run the Strapi command to check expired offers
    const result = execSync('npm run strapi strapi:shell -- --eval "strapi.service(\'api::product.product\').checkExpiredOffers()"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Expired offers check completed successfully');
    console.log('📊 Result:', result);
    
  } catch (error) {
    console.error('❌ Error checking expired offers:', error.message);
    
    if (error.stdout) {
      console.log('STDOUT:', error.stdout);
    }
    
    if (error.stderr) {
      console.log('STDERR:', error.stderr);
    }
    
    process.exit(1);
  }
}

// Run the function
checkExpiredOffers()
  .then(() => {
    console.log('🎯 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 