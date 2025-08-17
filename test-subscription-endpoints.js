const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testSubscriptionEndpoints() {
  console.log('🔍 Testing subscription endpoints...');
  
  const endpoints = [
    '/api/subscriptions',
    '/api/subscriptions/create-with-payment',
    '/api/subscription-plans',
    '/api/subscription-plans/active'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📝 Testing: ${endpoint}`);
      const response = await axios.get(`${API_URL}${endpoint}`);
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Status: ${error.response?.status} - ${error.response?.data?.error?.message || 'Unknown error'}`);
    }
  }
  
  // Test subscription creation endpoint
  console.log('\n📝 Testing subscription creation endpoint...');
  try {
    const createResponse = await axios.post(`${API_URL}/api/subscriptions/create-with-payment`, {
      vendorId: 1,
      planId: 2,
      paymentData: {
        paymentId: 'test_payment_id',
        orderId: 'test_order_id',
        paymentMethod: 'razorpay'
      }
    });
    console.log('✅ Subscription creation endpoint exists');
  } catch (error) {
    console.log(`❌ Subscription creation endpoint: ${error.response?.status} - ${error.response?.data?.error?.message || 'Unknown error'}`);
  }
}

testSubscriptionEndpoints(); 