const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testOrdersAPI() {
  try {
    console.log('🧪 Testing Orders API...\n');

    // Step 1: Test if server is running
    console.log('1. Testing server connectivity...');
    try {
      const healthResponse = await axios.get(`${API_URL}/api/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('Please start the Strapi server with: npm run develop');
      return;
    }

    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const token = loginResponse.data.jwt;
    console.log('✅ Login successful\n');

    // Step 3: Test getting all orders
    console.log('3. Testing get all orders...');
    const ordersResponse = await axios.get(`${API_URL}/api/orders?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Found ${ordersResponse.data.data?.length || 0} orders`);
    
    if (ordersResponse.data.data?.length > 0) {
      console.log('Sample order data:');
      console.log(JSON.stringify(ordersResponse.data.data[0], null, 2));
    }

    // Step 4: Test creating a test order
    console.log('\n4. Creating a test order...');
    const testOrderResponse = await axios.post(`${API_URL}/api/orders`, {
      data: {
        orderNumber: 'TEST-ORDER-APP-001',
        customerName: 'Test App Customer',
        customerEmail: 'testapp@example.com',
        deliveryType: 'pickup',
        pickupAddress: {
          name: 'Test Shop',
          address: '123 Test St',
          contact: '+91 1234567890'
        },
        pickupTime: '30min',
        totalAmount: 150.00,
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

    console.log(`✅ Test order created with ID: ${testOrderResponse.data.data.id}`);

    // Step 5: Test getting orders by email
    console.log('\n5. Testing get orders by email...');
    const emailFilterResponse = await axios.get(`${API_URL}/api/orders?filters[customerEmail][$eq]=testapp@example.com&populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Found ${emailFilterResponse.data.data?.length || 0} orders for testapp@example.com`);

    console.log('\n🎉 Orders API test completed successfully!');
    console.log('✅ The React Native app should now be able to fetch orders');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testOrdersAPI(); 