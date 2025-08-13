const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function updateAdminCredentials() {
  try {
    console.log('👤 Updating admin credentials...');
    
    // First, login with current credentials
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin123!'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Login successful with current credentials');
    
    // Update the user with new credentials
    const updateResponse = await axios.put(`${API_URL}/api/users/2`, {
      email: 'admin@gmail.com',
      username: 'admin'
    }, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin email updated to: admin@gmail.com');
    
    // Now update the password
    const passwordResponse = await axios.post(`${API_URL}/api/auth/change-password`, {
      currentPassword: 'Admin123!',
      password: 'Admin@123',
      passwordConfirmation: 'Admin@123'
    }, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin password updated successfully!');
    console.log('📧 New Email: admin@gmail.com');
    console.log('🔑 New Password: Admin@123');
    
    // Test login with new credentials
    const newLoginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Login test with new credentials successful!');
    console.log('🎫 New JWT Token received');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating admin credentials:', error.response?.data || error.message);
    
    // If update fails, try creating a new admin user
    console.log('🔄 Trying to create new admin user...');
    try {
      const createResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'Admin@123'
      });
      
      console.log('✅ New admin user created successfully!');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: Admin@123');
      console.log('🆔 User ID:', createResponse.data.user.id);
      
      return true;
    } catch (createError) {
      console.error('❌ Error creating new admin user:', createError.response?.data || createError.message);
      return false;
    }
  }
}

// Run the script
updateAdminCredentials().then(success => {
  if (success) {
    console.log('🎉 Admin credentials updated successfully!');
    console.log('🔧 You can now login to the admin panel with:');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: Admin@123');
    console.log('🌐 Go to: http://localhost:1337/admin');
  } else {
    console.log('💥 Admin credentials update failed.');
  }
}); 