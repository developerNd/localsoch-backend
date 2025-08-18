const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function approveVendorManually() {
  try {
    console.log('🔧 Manually approving vendor...');
    
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

    // Get all vendors to see which one needs approval
    const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=user`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📋 Available vendors:');
    vendorsResponse.data.data.forEach((vendor, index) => {
      console.log(`${index + 1}. ID: ${vendor.id}, Name: ${vendor.name}, isApproved: ${vendor.isApproved}, Status: ${vendor.status}`);
    });

    // Find the vendor that needs approval (assuming it's the first one with isApproved: false)
    const vendorToApprove = vendorsResponse.data.data.find(v => !v.isApproved);
    
    if (!vendorToApprove) {
      console.log('✅ All vendors are already approved!');
      return;
    }

    console.log(`\n🔧 Approving vendor: ${vendorToApprove.name} (ID: ${vendorToApprove.id})`);

    // Update the vendor to set isApproved to true
    const updateResponse = await axios.put(`${API_URL}/api/vendors/${vendorToApprove.id}`, {
      isApproved: true,
      status: 'approved',
      statusReason: 'Manually approved via script',
      statusUpdatedAt: new Date()
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Vendor approved successfully!');
    console.log('📝 Updated vendor data:', updateResponse.data.data);

    // Also update the user role to seller if there's a user
    if (vendorToApprove.user) {
      console.log(`🔧 Updating user role to seller for user: ${vendorToApprove.user.id}`);
      
      const userUpdateResponse = await axios.put(`${API_URL}/api/users/${vendorToApprove.user.id}`, {
        role: 3 // seller role ID
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ User role updated to seller');
      console.log('📝 Updated user data:', userUpdateResponse.data);
    }

    console.log('\n🎉 Vendor approval completed successfully!');
    console.log('🔧 The seller should now be able to access the dashboard.');

  } catch (error) {
    console.error('❌ Error approving vendor:', error.response?.data || error.message);
  }
}

// Run the script
approveVendorManually(); 