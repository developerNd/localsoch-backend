const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testPutRoute() {
  try {
    console.log('🔍 Testing PUT route...\n');

    // Test 1: Check if PUT route exists
    console.log('📋 Test 1: Testing PUT route with minimal data...');
    
    try {
      const response = await axios.put(`${API_URL}/api/orders/39`, {
        data: { status: 'test' }
      });
      console.log('✅ PUT route works:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ PUT route exists (401 expected without auth)');
      } else if (error.response?.status === 404) {
        console.log('❌ PUT route not found (404)');
      } else {
        console.log('⚠️ PUT route response:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Check if the route is properly configured
    console.log('\n📋 Test 2: Testing with different order ID...');
    
    try {
      const response = await axios.put(`${API_URL}/api/orders/1`, {
        data: { status: 'test' }
      });
      console.log('✅ PUT route works with order 1:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ PUT route exists for order 1 (401 expected without auth)');
      } else if (error.response?.status === 404) {
        console.log('❌ PUT route not found for order 1 (404)');
      } else {
        console.log('⚠️ PUT route response for order 1:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Check if the issue is with the specific order
    console.log('\n📋 Test 3: Testing GET vs PUT for order 39...');
    
    try {
      const getResponse = await axios.get(`${API_URL}/api/orders/39`);
      console.log('✅ GET works for order 39');
    } catch (error) {
      console.log('❌ GET fails for order 39:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Error testing PUT route:', error.response?.data || error.message);
  }
}

// Run the test
testPutRoute(); 