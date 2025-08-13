const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function createSuperAdminCorrect() {
  try {
    console.log('👑 Creating super admin user with correct password...');
    
    // Create super admin user with correct password
    const createResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: 'superadmin',
      email: 'admin@gmail.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Super admin user created successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: Admin@123');
    console.log('🆔 User ID:', createResponse.data.user.id);
    console.log('🎫 JWT Token:', createResponse.data.jwt);
    
    // Test login with new super admin credentials
    console.log('\n🔐 Testing login with super admin credentials...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Login test successful!');
    
    // Test role and permissions
    const jwt = loginResponse.data.jwt;
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
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
    console.error('❌ Error creating super admin user:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already taken')) {
      console.log('ℹ️ Super admin user already exists. Trying to login...');
      
      try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
          identifier: 'admin@gmail.com',
          password: 'Admin@123'
        });
        
        console.log('✅ Login successful with existing super admin user!');
        console.log('📧 Email: admin@gmail.com');
        console.log('🔑 Password: Admin@123');
        console.log('🆔 User ID:', loginResponse.data.user.id);
        
        // Test role and permissions
        const jwt = loginResponse.data.jwt;
        const headers = {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        };
        
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
createSuperAdminCorrect().then(success => {
  if (success) {
    console.log('\n🎉 Super admin user setup completed!');
    console.log('🔧 You can now:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. Login with: admin@gmail.com / Admin@123');
    console.log('3. Set up permissions through the admin panel');
    console.log('4. Run seed scripts to restore data');
  } else {
    console.log('\n💥 Super admin user setup failed.');
    console.log('🔧 Please check the server status or try different credentials.');
  }
}); 