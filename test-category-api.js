const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testCategoryAPI() {
  try {
    console.log('🔍 Testing category API...');
    
    // Test GET categories
    console.log('\n📡 Testing GET /api/categories');
    const getResponse = await axios.get(`${API_URL}/api/categories`);
    console.log('✅ GET Response:', getResponse.status);
    console.log('📊 Data:', JSON.stringify(getResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing category API:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCategoryAPI(); 