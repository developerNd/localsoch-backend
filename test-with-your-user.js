const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function testWithYourUser() {
  try {
    console.log('🧪 Testing with your user: test@gmail.com');
    
    // Login with your user
    console.log('👤 Logging in with test@gmail.com...');
    const loginResponse = await axios.post(`${STRAPI_URL}/api/auth/local`, {
      identifier: 'test@gmail.com',
      password: 'Test@123'
    });
    
    const userToken = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    
    console.log('✅ Login successful');
    console.log('🆔 User ID:', userId);
    console.log('🎫 JWT Token:', userToken.substring(0, 20) + '...');
    
    // Create an order WITHOUT the user field (since that's causing issues)
    const order = {
      orderNumber: `ORD-${Date.now()}`,
      customerName: 'Test Customer',
      customerEmail: 'test@gmail.com',
      customerPhone: '+91 98765 43210',
      totalAmount: 100.00,
      status: 'pending',
      orderItems: [
        {
          productId: 1,
          quantity: 1,
          totalAmount: 100.00,
          productName: 'Test Product'
        }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      notes: 'Test order from React Native app'
      // Removed user field for now
    };
    
    console.log('📝 Creating order...');
    const orderResponse = await axios.post(`${STRAPI_URL}/api/orders`, {
      data: order
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Order created successfully!');
    console.log('📋 Response status:', orderResponse.status);
    console.log('📋 Order data:', JSON.stringify(orderResponse.data, null, 2));
    
    // Test retrieving orders
    console.log('📋 Retrieving orders...');
    const getResponse = await axios.get(`${STRAPI_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    console.log('✅ Orders retrieved successfully!');
    console.log('📋 Total orders:', getResponse.data.data.length);
    
    console.log('🎉 Test completed successfully!');
    console.log('📱 The React Native app should work if we remove the user field from the order data.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔧 Authentication failed. Please check the user credentials.');
    } else if (error.response?.status === 403) {
      console.log('🔧 Permission issue. Please check the permissions again.');
    } else if (error.response?.status === 400) {
      console.log('🔧 Bad request. Check the order data format.');
    }
  }
}

testWithYourUser(); 