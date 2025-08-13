const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Restarting Strapi server...');

// Kill any existing Strapi processes
exec('pkill -f "strapi"', (error) => {
  if (error) {
    console.log('No existing Strapi processes found');
  } else {
    console.log('✅ Killed existing Strapi processes');
  }
  
  // Wait a moment then start the server
  setTimeout(() => {
    console.log('🚀 Starting Strapi server...');
    exec('npm run develop', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error starting server:', error);
        return;
      }
      console.log('✅ Server started successfully');
      console.log(stdout);
    });
  }, 2000);
}); 