const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testOrder39() {
  try {
    console.log('🔍 Testing order ID 39...\n');

    // Test 1: Check if order 39 exists
    console.log('📋 Test 1: Checking if order 39 exists...');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders/39`);
      console.log('✅ Order 39 found:', {
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
      } else {
        console.log('⚠️ Unexpected response for order 39:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Check all orders to see what IDs exist
    console.log('\n📋 Test 2: Checking all orders...');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders`, {
        params: {
          'pagination[pageSize]': 10,
          'sort[0]': 'createdAt:desc'
        }
      });
      
      if (response.data && response.data.data) {
        console.log(`✅ Found ${response.data.data.length} orders:`);
        response.data.data.forEach((order, index) => {
          console.log(`   ${index + 1}. ID: ${order.id}, Order Number: ${order.orderNumber}, Status: ${order.status}`);
        });
      } else {
        console.log('❌ No orders found');
      }
    } catch (error) {
      console.log('❌ Error fetching orders:', error.response?.status, error.response?.data);
    }

    // Test 3: Check if there's an order with the specific order number
    console.log('\n📋 Test 3: Looking for order with number ORD-1755942401726-607...');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders`, {
        params: {
          'filters[orderNumber][$eq]': 'ORD-1755942401726-607'
        }
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        const order = response.data.data[0];
        console.log('✅ Found order with matching order number:', {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status
        });
      } else {
        console.log('❌ No order found with order number ORD-1755942401726-607');
      }
    } catch (error) {
      console.log('❌ Error searching for order:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error testing order 39:', error.response?.data || error.message);
  }
}

// Run the test
testOrder39(); 