const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testSellerPermissions() {
  try {
    console.log('🔧 Testing seller permissions...');
    
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
    console.log('📝 Current permissions:', Object.keys(sellerRole.permissions));

    // Check if vendor permissions exist
    if (!sellerRole.permissions['api::vendor.vendor']) {
      console.log('❌ Vendor permissions missing!');
      
      // Add vendor permissions
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

      console.log('✅ Vendor permissions added to seller role');
    } else {
      console.log('✅ Vendor permissions exist');
    }

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
    try {
      const vendorResponse = await axios.get(`${API_URL}/api/vendors?populate=user`, {
        headers: {
          'Authorization': `Bearer ${sellerJwt}`
        }
      });
      console.log('✅ Vendor API successful!');
      console.log('📝 Vendor count:', vendorResponse.data.data?.length || 0);
    } catch (vendorError) {
      console.log('❌ Vendor API failed:', vendorError.response?.data?.error?.message);
    }

    // Test user/me endpoint
    console.log('\n👤 Testing /api/users/me endpoint...');
    try {
      const meResponse = await axios.get(`${API_URL}/api/users/me?populate=role`, {
        headers: {
          'Authorization': `Bearer ${sellerJwt}`
        }
      });
      console.log('✅ /api/users/me successful!');
      console.log('📝 User role:', meResponse.data.role?.name);
    } catch (meError) {
      console.log('❌ /api/users/me failed:', meError.response?.data?.error?.message);
    }

  } catch (error) {
    console.error('❌ Error testing seller permissions:', error.response?.data || error.message);
  }
}

// Run the test
testSellerPermissions(); 