const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testCancelOrder() {
  try {
    console.log('🔍 Testing cancel order endpoint...\n');

    // Test 1: Check if the endpoint exists
    console.log('📋 Test 1: Checking if cancel endpoint exists...');
    
    try {
      const response = await axios.put(`${API_URL}/api/orders/1/cancel`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Endpoint exists and responded:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint exists (401 expected without auth)');
      } else if (error.response?.status === 404) {
        console.log('❌ Endpoint not found (404)');
        return;
      } else {
        console.log('⚠️ Endpoint responded with:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Check authentication requirement
    console.log('\n📋 Test 2: Testing authentication requirement...');
    
    try {
      const response = await axios.put(`${API_URL}/api/orders/1/cancel`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Endpoint should require authentication but didn\'t');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication required (401)');
      } else {
        console.log('⚠️ Unexpected response:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Check with invalid token
    console.log('\n📋 Test 3: Testing with invalid token...');
    
    try {
      const response = await axios.put(`${API_URL}/api/orders/1/cancel`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token rejected (401)');
      } else {
        console.log('⚠️ Unexpected response with invalid token:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n📋 Test 4: Checking order routes...');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders`);
      console.log('✅ Orders endpoint accessible');
    } catch (error) {
      console.log('❌ Orders endpoint not accessible:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Error testing cancel order:', error.response?.data || error.message);
  }
}

// Run the test
testCancelOrder(); 