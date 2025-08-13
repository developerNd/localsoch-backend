const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function updateSellerPassword() {
  try {
    console.log('🔧 Updating seller password...');
    
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

    // Find the seller user (testseller with seller role)
    const usersResponse = await axios.get(`${API_URL}/api/users?populate=role`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const sellerUser = usersResponse.data.find(user => 
      user.username === 'testseller' && user.role?.name === 'seller'
    );

    if (!sellerUser) {
      throw new Error('Seller user not found');
    }

    console.log('✅ Found seller user, ID:', sellerUser.id);

    // Update the password
    const updateData = {
      password: 'seller123'
    };

    const updateResponse = await axios.put(`${API_URL}/api/users/${sellerUser.id}`, updateData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (updateResponse.data.user) {
      console.log('✅ Seller password updated successfully!');
      console.log('   User ID:', updateResponse.data.user.id);
      console.log('   Username:', updateResponse.data.user.username);
      console.log('   Email:', updateResponse.data.user.email);
      
      return updateResponse.data.user.id;
    } else {
      throw new Error('Failed to update seller password');
    }

  } catch (error) {
    console.error('❌ Error updating seller password:', error.response?.data || error.message);
    return null;
  }
}

// Run the script
updateSellerPassword().then(userId => {
  if (userId) {
    console.log('\n🎉 Seller password update completed!');
    console.log('📝 User ID for future reference:', userId);
    console.log('🔧 Now you can login with:');
    console.log('   Username: testseller');
    console.log('   Password: seller123');
  } else {
    console.log('\n💥 Seller password update failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 