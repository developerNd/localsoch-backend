const axios = require('axios');

const API_URL = 'http://192.168.1.102:1337';

async function testMobileAppFlow() {
  try {
    console.log('🧪 Testing mobile app flow...');
    
    // Step 1: Login as the test user
    console.log('📝 Logging in as test user...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'test',
      password: 'test123'
    });
    
    const token = loginResponse.data.jwt;
    const user = loginResponse.data.user;
    console.log('✅ Login successful');
    console.log('👤 User:', user.email);
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    // Step 2: Get current user (like mobile app does)
    console.log('📝 Getting current user...');
    const userResponse = await axios.get(`${API_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Current user retrieved:', userResponse.data.email);
    
    // Step 3: Get all orders (like mobile app does)
    console.log('📝 Getting all orders...');
    const allOrdersResponse = await axios.get(`${API_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        'sort[0]': 'createdAt:desc'
      }
    });
    
    console.log('✅ All orders retrieved');
    console.log('📋 Total orders found:', allOrdersResponse.data.data?.length || 0);
    
    if (allOrdersResponse.data.data?.length > 0) {
      console.log('📋 Sample order:', allOrdersResponse.data.data[0].orderNumber);
    }
    
    // Step 4: Get filtered orders by email
    console.log('📝 Getting filtered orders by email...');
    const filteredResponse = await axios.get(`${API_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        'filters[customerEmail][$eq]': 'test3@gmail.com',
        'sort[0]': 'createdAt:desc'
      }
    });
    
    console.log('✅ Filtered orders retrieved');
    console.log('📋 Filtered orders count:', filteredResponse.data.data?.length || 0);
    
    if (filteredResponse.data.data?.length > 0) {
      console.log('📋 Sample filtered order:', filteredResponse.data.data[0].orderNumber);
    }
    
    console.log('🎉 Mobile app flow test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing mobile app flow:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('🔧 Authentication failed. Please check credentials.');
    } else if (error.response?.status === 403) {
      console.error('🔧 Permission denied. Please check permissions.');
    } else if (error.response?.status === 404) {
      console.error('🔧 API endpoint not found. Please check Strapi configuration.');
    }
    
    return false;
  }
}

// Run the test
testMobileAppFlow().then(success => {
  if (success) {
    console.log('🚀 Mobile app flow test passed!');
  } else {
    console.log('💥 Mobile app flow test failed!');
  }
}); 