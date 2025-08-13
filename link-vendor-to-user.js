const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function linkVendorToUser() {
  try {
    console.log('🔧 Linking vendor to user...');
    
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

    // Update vendor 6 to link to user 15
    const updateData = {
      data: {
        user: 15
      }
    };

    console.log('📝 Updating vendor 6 to link to user 15...');

    const updateResponse = await axios.put(`${API_URL}/api/vendors/6`, updateData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📝 Update response:', updateResponse.data);

    if (updateResponse.data.data) {
      console.log('✅ Vendor linked successfully!');
      console.log('   Vendor ID:', updateResponse.data.data.id);
      console.log('   Vendor Name:', updateResponse.data.data.name);
      console.log('   User ID:', updateResponse.data.data.user);
      
      return updateResponse.data.data.id;
    } else {
      throw new Error('Failed to link vendor to user');
    }

  } catch (error) {
    console.error('❌ Error linking vendor to user:', error.response?.data || error.message);
    if (error.response?.data?.error?.message) {
      console.error('📝 Error details:', error.response.data.error.message);
    }
    return null;
  }
}

// Run the script
linkVendorToUser().then(vendorId => {
  if (vendorId) {
    console.log('\n🎉 Vendor linking completed!');
    console.log('📝 Vendor ID for future reference:', vendorId);
    console.log('🔧 Now seller1 can access their vendor data');
  } else {
    console.log('\n💥 Vendor linking failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 