const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testPasswordEndpoint() {
  try {
    console.log('🧪 Testing password change endpoint...');
    
    // Test 1: Check if the endpoint exists
    console.log('\n1️⃣ Testing endpoint availability...');
    
    try {
      const response = await axios.post(`${API_URL}/api/users-permissions/auth/change-password`, {
        currentPassword: 'test',
        newPassword: 'test123'
      });
      console.log('❌ Should not succeed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint exists and requires authentication');
      } else if (error.response?.status === 404) {
        console.log('❌ Endpoint not found (404)');
        console.log('Response:', error.response.data);
      } else if (error.response?.status === 403) {
        console.log('❌ Endpoint exists but permission denied (403)');
        console.log('Response:', error.response.data);
      } else {
        console.log('⚠️ Unexpected response:', error.response?.status);
        console.log('Response:', error.response?.data);
      }
    }
    
    // Test 2: Check standard Strapi auth endpoints
    console.log('\n2️⃣ Testing standard Strapi auth endpoints...');
    
    const standardEndpoints = [
      '/api/auth/change-password',
      '/api/auth/local',
      '/api/auth/register',
      '/api/users-permissions/auth/change-password'
    ];
    
    for (const endpoint of standardEndpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`);
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint} - Status: ${error.response?.status || 'No response'}`);
        if (error.response?.data) {
          console.log(`   Response type: ${typeof error.response.data}`);
          if (typeof error.response.data === 'string') {
            console.log(`   Response preview: ${error.response.data.substring(0, 100)}...`);
          }
        }
      }
    }
    
    // Test 3: Check if the route is registered
    console.log('\n3️⃣ Checking registered routes...');
    
    try {
      const routesResponse = await axios.get(`${API_URL}/api/users-permissions/routes`);
      console.log('✅ Routes endpoint accessible');
      
      const routes = routesResponse.data;
      const authRoutes = routes.filter(route => route.path.includes('auth'));
      console.log('🔍 Auth routes found:', authRoutes.map(r => r.path));
      
    } catch (error) {
      console.log('❌ Could not fetch routes:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPasswordEndpoint(); 