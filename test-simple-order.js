const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function testSimpleOrder() {
  try {
    console.log('🧪 Testing simple order creation...');
    
    // Create a test user
    const testUser = {
      username: `testuser${Date.now()}`,
      email: `testuser${Date.now()}@example.com`,
      password: 'Test123!'
    };
    
    console.log('👤 Creating test user...');
    const userResponse = await axios.post(`${STRAPI_URL}/api/auth/local/register`, testUser);
    const userToken = userResponse.data.jwt;
    const userId = userResponse.data.user.id;
    
    console.log('✅ Test user created:', testUser.email);
    
    // Create a simple order
    const order = {
      orderNumber: `ORD-${Date.now()}`,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 98765 43210',
      totalAmount: 50.00,
      status: 'pending',
      orderItems: [
        {
          productId: 1,
          quantity: 1,
          totalAmount: 50.00,
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
      notes: 'Test order',
      vendor: 26,
      user: userId
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
    console.log('📋 Order ID:', orderResponse.data.data.id);
    console.log('📋 Order Number:', orderResponse.data.data.attributes.orderNumber);
    
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
    console.log('📱 The React Native app should now work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('');
      console.log('🔧 PERMISSION ISSUE DETECTED!');
      console.log('Please follow the steps in QUICK_FIX_GUIDE.md');
      console.log('1. Go to http://localhost:1337/admin');
      console.log('2. Set up Order permissions for Authenticated role');
      console.log('3. Run this test again');
    }
  }
}

testSimpleOrder(); 