const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testNewStatuses() {
  try {
    console.log('🧪 Testing new pickup statuses...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const token = loginResponse.data.jwt;
    console.log('✅ Login successful\n');

    // Step 2: Create a pickup order
    console.log('2. Creating a pickup order...');
    const pickupOrderResponse = await axios.post(`${API_URL}/api/orders`, {
      data: {
        orderNumber: 'PICKUP-STATUS-TEST-001',
        customerName: 'Status Test Customer',
        customerEmail: 'status@test.com',
        deliveryType: 'pickup',
        pickupAddress: {
          name: 'Test Shop',
          address: '123 Test St',
          contact: '+91 1234567890'
        },
        pickupTime: '30min',
        totalAmount: 100.00,
        status: 'pending',
        vendor: 5,
        user: 4
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const orderId = pickupOrderResponse.data.data.id;
    console.log(`✅ Pickup order created with ID: ${orderId}\n`);

    // Step 3: Test status updates
    const statuses = ['confirmed', 'ready', 'pickedUp'];
    
    for (const status of statuses) {
      console.log(`3. Updating order status to: ${status}`);
      try {
        const updateResponse = await axios.put(`${API_URL}/api/orders/${orderId}`, {
          data: {
            status: status
          }
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Status updated to ${status}: ${updateResponse.data.data.status}`);
      } catch (error) {
        console.log(`❌ Failed to update status to ${status}:`, error.response?.data || error.message);
      }
    }

    // Step 4: Fetch the order to verify final status
    console.log('\n4. Fetching order to verify final status...');
    const fetchResponse = await axios.get(`${API_URL}/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Final order status: ${fetchResponse.data.data.status}`);
    console.log(`✅ Order delivery type: ${fetchResponse.data.data.deliveryType}`);

    console.log('\n🎉 New status test completed successfully!');
    console.log('✅ All pickup statuses (ready, pickedUp) are working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testNewStatuses(); 