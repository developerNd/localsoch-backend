const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testCurrentCredentials() {
  console.log('🔐 Testing current working credentials...');
  
  // Test original credentials
  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin@123' // Updated password
    });
    
    console.log('✅ Login successful with: admin@cityshopping.com / Admin@123');
    console.log('🎫 JWT Token received');
    console.log('🆔 User ID:', loginResponse.data.user.id);
    
    const jwt = loginResponse.data.jwt;
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Test API access
    console.log('\n🧪 Testing API access...');
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
    
    return true;
    
  } catch (error) {
    console.log('❌ Login failed with updated password');
    
    // Try with original password
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'admin@cityshopping.com',
        password: 'Admin123!' // Original password
      });
      
      console.log('✅ Login successful with: admin@cityshopping.com / Admin123!');
      console.log('🎫 JWT Token received');
      console.log('🆔 User ID:', loginResponse.data.user.id);
      
      return true;
      
    } catch (originalError) {
      console.log('❌ Login failed with original password too');
      return false;
    }
  }
}

testCurrentCredentials().then(success => {
  if (success) {
    console.log('\n🎉 Credentials are working!');
    console.log('🔧 You can now:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. Login with the working credentials');
    console.log('3. Set up permissions manually');
    console.log('4. Run seed scripts to restore data');
  } else {
    console.log('\n💥 No working credentials found.');
    console.log('🔧 Please check your admin credentials.');
  }
}); 