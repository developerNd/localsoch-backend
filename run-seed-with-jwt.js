const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:1337';

async function getJWTToken() {
  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin@123'
    });
    return loginResponse.data.jwt;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function updateSeedScriptsWithJWT(jwt) {
  console.log('🔧 Updating seed scripts with fresh JWT token...');
  
  const seedScripts = [
    'scripts/seed-products.js',
    'scripts/seed-banners-featured.js',
    'scripts/seed-button-configs.js'
  ];
  
  for (const scriptPath of seedScripts) {
    if (fs.existsSync(scriptPath)) {
      try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Replace the hardcoded API token with JWT token
        content = content.replace(
          /const STRAPI_API_TOKEN = '[^']*';/,
          `const STRAPI_API_TOKEN = '${jwt}';`
        );
        
        // Also replace Authorization header to use Bearer token
        content = content.replace(
          /Authorization: `Bearer \${STRAPI_API_TOKEN}`/g,
          'Authorization: `Bearer ${STRAPI_API_TOKEN}`'
        );
        
        fs.writeFileSync(scriptPath, content);
        console.log(`✅ Updated ${scriptPath}`);
      } catch (error) {
        console.log(`❌ Failed to update ${scriptPath}:`, error.message);
      }
    }
  }
}

async function runSeedScripts() {
  console.log('🌱 Running seed scripts...');
  
  const scripts = [
    'scripts/seed-products.js',
    'scripts/seed-banners-featured.js',
    'scripts/seed-button-configs.js'
  ];
  
  for (const script of scripts) {
    if (fs.existsSync(script)) {
      console.log(`\n📦 Running ${script}...`);
      try {
        const output = execSync(`node ${script}`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        console.log(`✅ ${script} completed successfully`);
        console.log(output);
      } catch (error) {
        console.log(`❌ ${script} failed:`, error.message);
        if (error.stdout) console.log('Output:', error.stdout);
        if (error.stderr) console.log('Error:', error.stderr);
      }
    } else {
      console.log(`⚠️ ${script} not found`);
    }
  }
}

async function main() {
  console.log('🚀 Starting seed process with fresh JWT token...');
  
  // Get fresh JWT token
  const jwt = await getJWTToken();
  if (!jwt) {
    console.log('💥 Failed to get JWT token. Please check your credentials.');
    return;
  }
  
  console.log('✅ Got fresh JWT token');
  
  // Update seed scripts
  await updateSeedScriptsWithJWT(jwt);
  
  // Run seed scripts
  await runSeedScripts();
  
  // Test API
  console.log('\n🧪 Testing API after seeding...');
  try {
    const testResponse = await axios.get(`${API_URL}/api/products`);
    console.log(`✅ Products API working: ${testResponse.data.data?.length || 0} products found`);
  } catch (error) {
    console.log('❌ Products API still not working:', error.response?.status);
  }
  
  console.log('\n🎉 Seed process completed!');
  console.log('🔧 Check your React Native app to see if data is loaded.');
}

main().catch(console.error); 