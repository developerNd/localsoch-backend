const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testApiEndpoints() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test public access
    console.log('\n🌐 Testing public access...');
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
        const response = await axios.get(`${API_URL}${endpoint}`);
        console.log(`✅ ${endpoint}: ${response.data.data?.length || 0} items found`);
        if (response.data.data && response.data.data.length > 0) {
          console.log(`   Sample data:`, response.data.data[0]);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    // Test with authentication
    console.log('\n🔐 Testing with authentication...');
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'admin@gmail.com',
        password: 'admin@123'
      });
      
      const jwt = loginResponse.data.jwt;
      const headers = {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      };
      
      console.log('✅ Login successful');
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${API_URL}${endpoint}`, { headers });
          console.log(`✅ ${endpoint} (auth): ${response.data.data?.length || 0} items found`);
        } catch (error) {
          console.log(`❌ ${endpoint} (auth): ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
        }
      }
      
      // Test creating a simple category
      console.log('\n📝 Testing data creation...');
      try {
        const createResponse = await axios.post(`${API_URL}/api/categories`, {
          data: {
            name: 'Test Category',
            description: 'Test description',
            slug: 'test-category'
          }
        }, { headers });
        
        console.log('✅ Category creation successful:', createResponse.data);
      } catch (error) {
        console.log('❌ Category creation failed:', error.response?.status, error.response?.data);
      }
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
    }
    
    // Test content types
    console.log('\n📋 Testing content types...');
    try {
      const contentTypesResponse = await axios.get(`${API_URL}/api/content-type-builder/content-types`);
      console.log('✅ Content types accessible');
      console.log('Available content types:', contentTypesResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Content types not accessible:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testApiEndpoints(); 