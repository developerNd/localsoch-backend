const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function finalTest() {
  try {
    console.log('🎯 Final test with your user credentials...');
    
    // Login with your user
    console.log('👤 Logging in with test@gmail.com...');
    const loginResponse = await axios.post(`${STRAPI_URL}/api/auth/local`, {
      identifier: 'test@gmail.com',
      password: 'Test@123'
    });
    
    const userToken = loginResponse.data.jwt;
    const userEmail = loginResponse.data.user.email;
    
    console.log('✅ Login successful');
    console.log('📧 User email:', userEmail);
    
    // Create an order (without user field)
    const order = {
      orderNumber: `ORD-${Date.now()}`,
      customerName: 'Test Customer',
      customerEmail: userEmail,
      customerPhone: '+91 98765 43210',
      totalAmount: 150.00,
      status: 'pending',
      orderItems: [
        {
          productId: 1,
          quantity: 2,
          totalAmount: 100.00,
          productName: 'Product 1'
        },
        {
          productId: 2,
          quantity: 1,
          totalAmount: 50.00,
          productName: 'Product 2'
        }
      ],
      shippingAddress: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      notes: 'Test order from React Native app',
      vendor: 26
    };
    
    console.log('📝 Creating order...');
    const createResponse = await axios.post(`${STRAPI_URL}/api/orders`, {
      data: order
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Order created successfully!');
    console.log('📋 Order ID:', createResponse.data.data.id);
    console.log('📋 Order Number:', createResponse.data.data.attributes.orderNumber);
    
    // Test retrieving orders by email
    console.log('📋 Retrieving orders by email...');
    const getResponse = await axios.get(`${STRAPI_URL}/api/orders?filters[customerEmail][$eq]=${userEmail}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    console.log('✅ Orders retrieved successfully!');
    console.log('📋 Total orders for this user:', getResponse.data.data.length);
    
    // Show order details
    getResponse.data.data.forEach((order, index) => {
      console.log(`📋 Order ${index + 1}:`, {
        id: order.id,
        orderNumber: order.attributes.orderNumber,
        totalAmount: order.attributes.totalAmount,
        status: order.attributes.status,
        createdAt: order.attributes.createdAt
      });
    });
    
    console.log('');
    console.log('🎉 FINAL TEST COMPLETED SUCCESSFULLY!');
    console.log('📱 The React Native app should now work correctly.');
    console.log('');
    console.log('✅ Order creation: WORKING');
    console.log('✅ Order retrieval: WORKING');
    console.log('✅ User authentication: WORKING');
    console.log('✅ Permissions: WORKING');
    console.log('');
    console.log('🚀 You can now test the React Native app!');
    
  } catch (error) {
    console.error('❌ Final test failed:', error.response?.data || error.message);
  }
}

finalTest(); 