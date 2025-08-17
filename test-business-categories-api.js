const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testBusinessCategoriesAPI() {
  try {
    console.log('🔍 Testing Business Categories API...');
    
    // Test GET business categories
    console.log('\n📡 Testing GET /api/business-categories');
    const getResponse = await axios.get(`${API_URL}/api/business-categories`);
    console.log('✅ GET Response:', getResponse.status);
    console.log('📊 Data:', JSON.stringify(getResponse.data, null, 2));
    
    if (getResponse.data.data && getResponse.data.data.length > 0) {
      console.log(`\n✅ Found ${getResponse.data.data.length} business categories`);
      getResponse.data.data.forEach((category, index) => {
        console.log(`  ${index + 1}. ${category.attributes.name} (ID: ${category.id})`);
      });
    } else {
      console.log('\n⚠️  No business categories found. Need to seed the data.');
    }
    
  } catch (error) {
    console.error('❌ Error testing business categories API:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testBusinessCategoriesAPI(); 