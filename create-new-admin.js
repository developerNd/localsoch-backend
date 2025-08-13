const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function createNewAdmin() {
  try {
    console.log('👤 Creating new admin user with your preferred credentials...');
    
    // Create new admin user
    const createResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'Admin@123'
    });
    
    console.log('✅ New admin user created successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: Admin@123');
    console.log('🆔 User ID:', createResponse.data.user.id);
    console.log('🎫 JWT Token:', createResponse.data.jwt);
    
    // Test login with new credentials
    console.log('\n🔐 Testing login with new credentials...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Login test successful!');
    
    // Test API access
    console.log('\n🧪 Testing API access...');
    const jwt = loginResponse.data.jwt;
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
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
    console.error('❌ Error creating new admin user:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already taken')) {
      console.log('ℹ️ User already exists. Trying to login...');
      
      try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
          identifier: 'admin@gmail.com',
          password: 'Admin@123'
        });
        
        console.log('✅ Login successful with existing user!');
        console.log('📧 Email: admin@gmail.com');
        console.log('🔑 Password: Admin@123');
        console.log('🆔 User ID:', loginResponse.data.user.id);
        
        return true;
      } catch (loginError) {
        console.error('❌ Login failed:', loginError.response?.data || loginError.message);
        return false;
      }
    }
    
    return false;
  }
}

// Run the script
createNewAdmin().then(success => {
  if (success) {
    console.log('\n🎉 Admin user setup completed!');
    console.log('🔧 You can now:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. Login with: admin@gmail.com / Admin@123');
    console.log('3. Set up permissions manually');
    console.log('4. Run seed scripts to restore data');
  } else {
    console.log('\n💥 Admin user setup failed.');
    console.log('🔧 Please try different credentials or check the server status.');
  }
}); 