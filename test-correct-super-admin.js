const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testCorrectSuperAdmin() {
  try {
    console.log('🔐 Testing super admin credentials with correct password...');
    
    // Test login with correct super admin credentials
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'Admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Super admin login successful!');
    console.log('🎫 JWT Token received');
    console.log('🆔 User ID:', loginResponse.data.user.id);
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Test user info to check role
    console.log('\n👤 Checking super admin role...');
    try {
      const userResponse = await axios.get(`${API_URL}/api/users/me`, { headers });
      console.log('✅ User info accessible');
      console.log('   - ID:', userResponse.data.id);
      console.log('   - Username:', userResponse.data.username);
      console.log('   - Email:', userResponse.data.email);
      console.log('   - Role:', userResponse.data.role?.name || 'No role assigned');
      console.log('   - Role ID:', userResponse.data.role?.id || 'No role ID');
    } catch (error) {
      console.log('❌ User info not accessible:', error.response?.status);
    }
    
    // Test API access with super admin
    console.log('\n🧪 Testing API access with super admin...');
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
    
    // Test if super admin can access roles
    console.log('\n👑 Testing role management access...');
    try {
      const rolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`, { headers });
      console.log('✅ Can access roles management');
      console.log('   - Available roles:', rolesResponse.data.roles?.length || 0);
      if (rolesResponse.data.roles) {
        rolesResponse.data.roles.forEach((role, index) => {
          console.log(`   ${index + 1}. ${role.name} (ID: ${role.id})`);
        });
      }
    } catch (error) {
      console.log('❌ Cannot access roles management:', error.response?.status);
    }
    
    return jwt;
    
  } catch (error) {
    console.error('❌ Super admin login failed:', error.response?.data || error.message);
    return null;
  }
}

// Run the script
testCorrectSuperAdmin().then(jwt => {
  if (jwt) {
    console.log('\n🎉 Super admin credentials are working!');
    console.log('🔧 You can now:');
    console.log('1. Use these credentials to access admin panel');
    console.log('2. Set up permissions through the admin panel');
    console.log('3. Run seed scripts to restore data');
  } else {
    console.log('\n💥 Super admin credentials are not working.');
    console.log('🔧 Please check the credentials or try the other admin user.');
  }
}); 