const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function assignAdminRoleAndUpdate() {
  try {
    console.log('🔧 Assigning admin role and updating credentials...');
    
    // Login with original credentials
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin123!'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Login successful with original credentials');
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // First, try to assign admin role
    console.log('👑 Assigning admin role...');
    try {
      const roleResponse = await axios.put(`${API_URL}/api/users/2`, {
        role: 1 // Authenticated role
      }, { headers });
      
      console.log('✅ Role assigned successfully');
    } catch (error) {
      console.log('❌ Could not assign role via API:', error.response?.status);
      console.log('🔧 This needs to be done manually in the admin panel');
    }
    
    // Update email
    console.log('📧 Updating email...');
    try {
      const updateResponse = await axios.put(`${API_URL}/api/users/2`, {
        email: 'admin@gmail.com'
      }, { headers });
      
      console.log('✅ Email updated to: admin@gmail.com');
    } catch (error) {
      console.log('❌ Could not update email:', error.response?.status);
    }
    
    // Try to change password
    console.log('🔑 Updating password...');
    try {
      const passwordResponse = await axios.post(`${API_URL}/api/auth/change-password`, {
        currentPassword: 'Admin123!',
        password: 'Admin@123',
        passwordConfirmation: 'Admin@123'
      }, { headers });
      
      console.log('✅ Password updated successfully!');
    } catch (error) {
      console.log('❌ Could not update password:', error.response?.status);
      console.log('🔧 Password change might require admin privileges');
    }
    
    // Test login with new credentials
    console.log('\n🔐 Testing new credentials...');
    try {
      const newLoginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'admin@gmail.com',
        password: 'Admin@123'
      });
      
      console.log('✅ Login successful with new credentials!');
      console.log('🎫 New JWT Token received');
      
      // Test admin access
      const newHeaders = {
        'Authorization': `Bearer ${newLoginResponse.data.jwt}`,
        'Content-Type': 'application/json'
      };
      
      console.log('\n🧪 Testing admin access...');
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
          const response = await axios.get(`${API_URL}${endpoint}`, { headers: newHeaders });
          console.log(`✅ ${endpoint}: ${response.data.data?.length || 0} items found`);
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Login with new credentials failed:', error.response?.data || error.message);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in role assignment and update:', error.response?.data || error.message);
    return false;
  }
}

// Run the script
assignAdminRoleAndUpdate().then(success => {
  if (success) {
    console.log('\n🎉 Setup completed!');
    console.log('🔧 Next steps:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. Login with: admin@gmail.com / Admin@123');
    console.log('3. If login fails, try: admin@cityshopping.com / Admin123!');
    console.log('4. Set up permissions manually in the admin panel');
    console.log('5. Run seed scripts to restore data');
  } else {
    console.log('\n💥 Setup failed.');
    console.log('🔧 Please try manual setup through the admin panel.');
  }
}); 