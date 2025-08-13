const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function completeReset() {
  console.log('🗑️ Starting complete database reset...');
  
  try {
    // Step 1: Stop Strapi server if running
    console.log('\n🛑 Step 1: Stopping Strapi server...');
    try {
      execSync('pkill -f "strapi develop"', { stdio: 'ignore' });
      console.log('✅ Strapi server stopped');
    } catch (error) {
      console.log('ℹ️ No Strapi server running');
    }
    
    // Step 2: Clear database files
    console.log('\n🗂️ Step 2: Clearing database files...');
    
    const dbPaths = [
      '.tmp',
      'tmp',
      'database/data.db',
      'database/data.db-journal'
    ];
    
    for (const dbPath of dbPaths) {
      if (fs.existsSync(dbPath)) {
        try {
          if (fs.lstatSync(dbPath).isDirectory()) {
            fs.rmSync(dbPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(dbPath);
          }
          console.log(`✅ Cleared ${dbPath}`);
        } catch (error) {
          console.log(`⚠️ Could not clear ${dbPath}: ${error.message}`);
        }
      }
    }
    
    // Step 3: Clear uploads
    console.log('\n📁 Step 3: Clearing uploads...');
    const uploadPaths = [
      'public/uploads',
      'data/uploads'
    ];
    
    for (const uploadPath of uploadPaths) {
      if (fs.existsSync(uploadPath)) {
        try {
          fs.rmSync(uploadPath, { recursive: true, force: true });
          console.log(`✅ Cleared ${uploadPath}`);
        } catch (error) {
          console.log(`⚠️ Could not clear ${uploadPath}: ${error.message}`);
        }
      }
    }
    
    // Step 4: Clear node modules and reinstall (optional)
    console.log('\n📦 Step 4: Reinstalling dependencies...');
    try {
      console.log('Removing node_modules...');
      fs.rmSync('node_modules', { recursive: true, force: true });
      console.log('Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies reinstalled');
    } catch (error) {
      console.log('⚠️ Could not reinstall dependencies: ${error.message}');
    }
    
    // Step 5: Start Strapi server
    console.log('\n🚀 Step 5: Starting Strapi server...');
    try {
      execSync('npm run develop', { stdio: 'inherit', detached: true });
      console.log('✅ Strapi server started');
    } catch (error) {
      console.log('⚠️ Could not start Strapi server: ${error.message}');
    }
    
    console.log('\n🎉 Complete reset completed!');
    console.log('🔧 Next steps:');
    console.log('1. Wait for Strapi server to fully start');
    console.log('2. Go to http://localhost:1337/admin');
    console.log('3. Create your first admin user');
    console.log('4. Set up content types and permissions');
    console.log('5. Run the database setup script');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during complete reset:', error.message);
    return false;
  }
}

// Run the complete reset
completeReset().then(success => {
  if (success) {
    console.log('\n🎉 Complete reset completed!');
    console.log('🔧 The database has been completely cleared and reset.');
  } else {
    console.log('\n💥 Complete reset failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 