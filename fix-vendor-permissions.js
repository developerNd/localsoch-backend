const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function fixVendorPermissions() {
  try {
    console.log('🔧 Fixing vendor permissions...');
    
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

    // Get seller role
    const roleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/4`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const sellerRole = roleResponse.data.role;
    console.log('✅ Found seller role:', sellerRole.name);

    // Update vendor permissions with correct format
    const updatedPermissions = {
      ...sellerRole.permissions,
      'api::vendor.vendor': {
        controllers: {
          'vendor': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' }
          }
        }
      }
    };

    console.log('📝 Updating vendor permissions...');

    // Update the seller role
    await axios.put(
      `${API_URL}/api/users-permissions/roles/${sellerRole.id}`,
      {
        ...sellerRole,
        permissions: updatedPermissions
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Vendor permissions updated');

    // Test seller login
    console.log('\n🧪 Testing seller login...');
    const sellerLoginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'seller1_demo@example.com',
      password: 'TestSeller123!'
    });

    const sellerJwt = sellerLoginResponse.data.jwt;
    console.log('✅ Seller login successful');

    // Test vendor API
    console.log('\n🏪 Testing vendor API...');
    const vendorResponse = await axios.get(`${API_URL}/api/vendors?populate=user`, {
      headers: {
        'Authorization': `Bearer ${sellerJwt}`
      }
    });
    console.log('✅ Vendor API successful!');
    console.log('📝 Vendor count:', vendorResponse.data.data?.length || 0);
    console.log('📝 Vendor data:', vendorResponse.data.data);

  } catch (error) {
    console.error('❌ Error fixing vendor permissions:', error.response?.data || error.message);
  }
}

// Run the fix
fixVendorPermissions(); 