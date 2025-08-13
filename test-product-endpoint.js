const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testProductEndpoint() {
  try {
    console.log('🧪 Testing product endpoint...');
    
    // Step 1: Login with super admin
    console.log('\n🔐 Step 1: Logging in with super admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Super admin login successful!');
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Test different HTTP methods on products endpoint
    console.log('\n🔍 Step 2: Testing HTTP methods on /api/products...');
    
    // Test GET method
    try {
      const getResponse = await axios.get(`${API_URL}/api/products`, { headers });
      console.log('✅ GET /api/products: Success');
      console.log('   Count:', getResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ GET /api/products: Failed -', error.response?.status);
    }
    
    // Test POST method
    try {
      const postResponse = await axios.post(`${API_URL}/api/products`, {
        data: {
          name: 'Test Product',
          description: 'Test description',
          price: 100.00
        }
      }, { headers });
      console.log('✅ POST /api/products: Success');
      console.log('   Created ID:', postResponse.data.data?.id);
    } catch (error) {
      console.log('❌ POST /api/products: Failed -', error.response?.status, error.response?.data);
    }
    
    // Test PUT method
    try {
      const putResponse = await axios.put(`${API_URL}/api/products/1`, {
        data: {
          name: 'Updated Test Product'
        }
      }, { headers });
      console.log('✅ PUT /api/products/1: Success');
    } catch (error) {
      console.log('❌ PUT /api/products/1: Failed -', error.response?.status);
    }
    
    // Test DELETE method
    try {
      const deleteResponse = await axios.delete(`${API_URL}/api/products/1`, { headers });
      console.log('✅ DELETE /api/products/1: Success');
    } catch (error) {
      console.log('❌ DELETE /api/products/1: Failed -', error.response?.status);
    }
    
    // Step 3: Check if there are any custom routes
    console.log('\n🔍 Step 3: Checking for custom routes...');
    try {
      const routesResponse = await axios.get(`${API_URL}/api/products`, { headers });
      console.log('✅ Products endpoint accessible');
      console.log('   Response structure:', Object.keys(routesResponse.data));
    } catch (error) {
      console.log('❌ Products endpoint not accessible:', error.response?.status);
    }
    
    // Step 4: Try creating a product without relations first
    console.log('\n📝 Step 4: Testing product creation without relations...');
    try {
      const simpleProductResponse = await axios.post(`${API_URL}/api/products`, {
        data: {
          name: 'Simple Test Product',
          description: 'A simple test product without relations',
          price: 50.00
        }
      }, { headers });
      console.log('✅ Simple product creation successful:', simpleProductResponse.data.data?.id);
    } catch (error) {
      console.log('❌ Simple product creation failed:', error.response?.status, error.response?.data);
    }
    
    // Step 5: Check if the issue is with the data structure
    console.log('\n🔍 Step 5: Checking data structure requirements...');
    try {
      const getResponse = await axios.get(`${API_URL}/api/products`, { headers });
      if (getResponse.data.data && getResponse.data.data.length > 0) {
        console.log('✅ Sample product structure:');
        console.log('   Fields:', Object.keys(getResponse.data.data[0].attributes || {}));
      }
    } catch (error) {
      console.log('❌ Could not get sample product structure:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing product endpoint:', error.response?.data || error.message);
  }
}

testProductEndpoint(); 