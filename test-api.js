const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  
  const endpoints = [
    '/api/categories',
    '/api/products',
    '/api/vendors',
    '/api/banners',
    '/api/featured-products',
    '/api/orders'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint}...`);
      const response = await axios.get(`${API_URL}${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.data.data?.length || 0} items found`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  // Test authentication
  console.log('\n🔐 Testing authentication...');
  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin123!'
    });
    console.log('✅ Authentication working');
    console.log('🎫 JWT Token received');
  } catch (error) {
    console.log('❌ Authentication failed:', error.response?.data?.error?.message || error.message);
  }
}

testAPI(); 