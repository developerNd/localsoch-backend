const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function createSellerUser() {
  try {
    console.log('🔧 Creating seller user...');
    
    // First, get admin token by logging in
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });

    if (!loginResponse.data.jwt) {
      throw new Error('Failed to login as admin');
    }

    const adminToken = loginResponse.data.jwt;
    console.log('✅ Admin login successful');

    // Get seller role ID
    const rolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const sellerRole = rolesResponse.data.roles.find(role => role.name === 'seller');
    if (!sellerRole) {
      throw new Error('Seller role not found');
    }

    console.log('✅ Found seller role, ID:', sellerRole.id);

    // Create seller user
    const userData = {
      username: 'seller1',
      email: 'seller1@example.com',
      password: 'seller123',
      confirmed: true,
      blocked: false,
      role: sellerRole.id
    };

    const userResponse = await axios.post(`${API_URL}/api/users`, userData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (userResponse.data.user) {
      console.log('✅ Seller user created successfully!');
      console.log('   User ID:', userResponse.data.user.id);
      console.log('   Username:', userResponse.data.user.username);
      console.log('   Email:', userResponse.data.user.email);
      console.log('   Role:', userResponse.data.user.role?.name);
      
      return userResponse.data.user.id;
    } else {
      throw new Error('Failed to create seller user');
    }

  } catch (error) {
    console.error('❌ Error creating seller user:', error.response?.data || error.message);
    return null;
  }
}

// Run the script
createSellerUser().then(userId => {
  if (userId) {
    console.log('\n🎉 Seller user setup completed!');
    console.log('📝 User ID for future reference:', userId);
    console.log('🔧 Now you can login with:');
    console.log('   Username: seller1');
    console.log('   Password: seller123');
  } else {
    console.log('\n💥 Seller user setup failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 