const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function fixUserMePermissions() {
  try {
    console.log('🔧 Fixing user/me endpoint permissions...');
    
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

    // Update permissions to include user/me endpoint
    const updatedPermissions = {
      ...sellerRole.permissions,
      'plugin::users-permissions': {
        controllers: {
          'auth': {
            callback: { enabled: true, policy: '' },
            changePassword: { enabled: true, policy: '' },
            resetPassword: { enabled: true, policy: '' },
            connect: { enabled: true, policy: '' },
            forgotPassword: { enabled: true, policy: '' },
            register: { enabled: true, policy: '' },
            emailConfirmation: { enabled: true, policy: '' },
            sendEmailConfirmation: { enabled: true, policy: '' }
          },
          'user': {
            me: { enabled: true, policy: '' },
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: false, policy: '' },
            update: { enabled: true, policy: '' },
            count: { enabled: false, policy: '' },
            destroy: { enabled: false, policy: '' }
          },
          'role': {
            createRole: { enabled: false, policy: '' },
            findOne: { enabled: true, policy: '' },
            find: { enabled: true, policy: '' },
            updateRole: { enabled: false, policy: '' },
            deleteRole: { enabled: false, policy: '' }
          },
          'permissions': {
            getPermissions: { enabled: false, policy: '' }
          }
        }
      }
    };

    console.log('📝 Updating user permissions...');

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

    console.log('✅ User permissions updated');

    // Test seller login
    console.log('\n🧪 Testing seller login...');
    const sellerLoginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'seller1_demo@example.com',
      password: 'TestSeller123!'
    });

    const sellerJwt = sellerLoginResponse.data.jwt;
    console.log('✅ Seller login successful');

    // Test user/me endpoint
    console.log('\n👤 Testing /api/users/me endpoint...');
    const meResponse = await axios.get(`${API_URL}/api/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${sellerJwt}`
      }
    });
    console.log('✅ /api/users/me successful!');
    console.log('📝 User role:', meResponse.data.role?.name);
    console.log('📝 User data:', meResponse.data);

  } catch (error) {
    console.error('❌ Error fixing user/me permissions:', error.response?.data || error.message);
  }
}

// Run the fix
fixUserMePermissions(); 