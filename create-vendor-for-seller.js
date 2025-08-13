const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function createVendorForSeller() {
  try {
    console.log('🔧 Creating vendor for seller...');
    
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

    // Create vendor for seller1 (user ID 15)
    const vendorData = {
      name: 'Demo Seller Shop',
      address: '123 Demo Street, Demo Area, Mumbai, Maharashtra 400001',
      contact: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      user: 15 // seller1 user ID
    };

    console.log('📝 Creating vendor with data:', {
      name: vendorData.name,
      user: vendorData.user
    });

    const vendorResponse = await axios.post(`${API_URL}/api/vendors`, {
      data: vendorData
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📝 Vendor response:', vendorResponse.data);

    if (vendorResponse.data.data) {
      console.log('✅ Vendor created successfully!');
      console.log('   Vendor ID:', vendorResponse.data.data.id);
      console.log('   Vendor Name:', vendorResponse.data.data.name);
      console.log('   User ID:', vendorResponse.data.data.user);
      
      return vendorResponse.data.data.id;
    } else {
      throw new Error('Failed to create vendor');
    }

  } catch (error) {
    console.error('❌ Error creating vendor:', error.response?.data || error.message);
    if (error.response?.data?.error?.message) {
      console.error('📝 Error details:', error.response.data.error.message);
    }
    return null;
  }
}

// Run the script
createVendorForSeller().then(vendorId => {
  if (vendorId) {
    console.log('\n🎉 Vendor setup completed!');
    console.log('📝 Vendor ID for future reference:', vendorId);
    console.log('🔧 Now seller1 can access their vendor data');
  } else {
    console.log('\n💥 Vendor setup failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 