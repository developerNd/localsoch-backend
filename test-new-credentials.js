const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testNewCredentials() {
  try {
    console.log('🔐 Testing new admin credentials...');
    
    // Try to login with the new credentials
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'Admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Login successful with new credentials!');
    console.log('🎫 JWT Token received');
    console.log('🆔 User ID:', loginResponse.data.user.id);
    
    // Test if we can access the admin panel
    console.log('\n🔍 Testing admin access...');
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Try to get user info
    try {
      const userResponse = await axios.get(`${API_URL}/api/users/me`, { headers });
      console.log('✅ User info accessible');
      console.log('👤 User:', userResponse.data.username, userResponse.data.email);
    } catch (error) {
      console.log('❌ User info not accessible:', error.response?.status);
    }
    
    // Test API endpoints
    console.log('\n🧪 Testing API endpoints with authentication...');
    
    const endpoints = [
      '/api/categories',
      '/api/products',
      '/api/vendors',
      '/api/banners',
      '/api/featured-products',
      '/api/orders'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, { headers });
        console.log(`✅ ${endpoint}: ${response.data.data?.length || 0} items found`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    return jwt;
    
  } catch (error) {
    console.error('❌ Login failed with new credentials:', error.response?.data || error.message);
    return null;
  }
}

// Run the script
testNewCredentials().then(jwt => {
  if (jwt) {
    console.log('\n🎉 New credentials are working!');
    console.log('🔧 Next steps:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. Login with: admin@gmail.com / Admin@123');
    console.log('3. Set up permissions manually');
    console.log('4. Run seed scripts');
  } else {
    console.log('\n💥 New credentials are not working.');
    console.log('🔧 Please check if the user exists or try different credentials.');
  }
}); 