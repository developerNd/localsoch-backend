const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testBusinessCategoryAPI() {
  try {
    console.log('🔍 Testing business category API...');
    
    // Test GET business categories
    console.log('\n📡 Testing GET /api/business-categories');
    const getResponse = await axios.get(`${API_URL}/api/business-categories`);
    console.log('✅ GET Response:', getResponse.status);
    console.log('📊 Data:', JSON.stringify(getResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing business category API:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testBusinessCategoryAPI(); 