const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testOrder39Fixed() {
  try {
    console.log('🔍 Testing order ID 39 after fix...\n');

    // Test 1: Check if order 39 can be accessed
    console.log('📋 Test 1: Checking if order 39 can be accessed...');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders/39`);
      console.log('✅ Order 39 accessed successfully:', {
        id: response.data.data?.id,
        orderNumber: response.data.data?.orderNumber,
        status: response.data.data?.status,
        totalAmount: response.data.data?.totalAmount
      });
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Order 39 not found (404)');
      } else if (error.response?.status === 401) {
        console.log('⚠️ Order 39 requires authentication (401)');
      } else if (error.response?.status === 500) {
        console.log('❌ Order 39 still has 500 error');
      } else {
        console.log('⚠️ Unexpected response for order 39:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Try to update order 39 (simulate cancel)
    console.log('\n📋 Test 2: Testing order 39 update (simulate cancel)...');
    
    try {
      const response = await axios.put(`${API_URL}/api/orders/39`, {
        data: { 
          status: 'cancelled',
          statusReason: 'Test cancellation',
          statusUpdatedAt: new Date()
        }
      });
      console.log('✅ Order 39 update successful:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Order 39 update requires authentication (401)');
      } else if (error.response?.status === 403) {
        console.log('❌ Order 39 update forbidden (403)');
      } else if (error.response?.status === 404) {
        console.log('❌ Order 39 not found for update (404)');
      } else {
        console.log('⚠️ Order 39 update response:', error.response?.status, error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Error testing order 39:', error.response?.data || error.message);
  }
}

// Run the test
testOrder39Fixed(); 