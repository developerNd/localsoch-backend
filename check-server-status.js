const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:1337';

async function checkServerStatus() {
  console.log('🔍 Checking Strapi server status...\n');
  
  try {
    // Test basic server connectivity
    console.log('📡 Test 1: Basic server connectivity...');
    const healthResponse = await axios.get(`${API_URL}/_health`, { timeout: 5000 });
    
    if (healthResponse.status === 200) {
      console.log('✅ Server is running and healthy');
      console.log('📊 Health response:', healthResponse.data);
    } else {
      console.log(`⚠️  Server responded with status: ${healthResponse.status}`);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running or not accessible');
      console.log('💡 Make sure to start the server with: npm run develop');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ Server hostname not found');
      console.log('💡 Check your API_URL configuration');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Server connection timed out');
      console.log('💡 Server might be starting up or overloaded');
    } else {
      console.log(`❌ Connection error: ${error.message}`);
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure Strapi server is running: npm run develop');
    console.log('2. Check if the server is accessible at:', API_URL);
    console.log('3. Verify your network configuration');
    console.log('4. Check if any firewall is blocking the connection');
    
    return;
  }
  
  try {
    // Test admin panel accessibility
    console.log('\n📡 Test 2: Admin panel accessibility...');
    const adminResponse = await axios.get(`${API_URL}/admin`, { timeout: 5000 });
    
    if (adminResponse.status === 200) {
      console.log('✅ Admin panel is accessible');
    } else {
      console.log(`⚠️  Admin panel responded with status: ${adminResponse.status}`);
    }
    
  } catch (error) {
    console.log(`⚠️  Admin panel test failed: ${error.message}`);
  }
  
  try {
    // Test API base endpoint
    console.log('\n📡 Test 3: API base endpoint...');
    const apiResponse = await axios.get(`${API_URL}/api`, { timeout: 5000 });
    
    if (apiResponse.status === 200) {
      console.log('✅ API base endpoint is accessible');
    } else {
      console.log(`⚠️  API base responded with status: ${apiResponse.status}`);
    }
    
  } catch (error) {
    console.log(`⚠️  API base test failed: ${error.message}`);
  }
  
  console.log('\n🎯 Server status check completed!');
}

// Run the check
checkServerStatus(); 