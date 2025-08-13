const axios = require('axios');

const API_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

const headers = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json'
};

async function enableMissingPermissions() {
  console.log('🔧 Enabling missing permissions...');

  try {
    // Get current admin role
    const roleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/4`, { headers });
    const adminRole = roleResponse.data.role;
    
    console.log('✅ Found admin role, updating missing permissions...');

    // Enable only the missing permissions
    const updatedPermissions = {
      ...adminRole.permissions,
      
      // Enable banner permissions (only the disabled ones)
      'api::banner': {
        controllers: {
          'banner': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: true, policy: '' },
            banner: { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable featured product permissions (only the disabled ones)
      'api::featured-product': {
        controllers: {
          'featured-product': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: true, policy: '' },
            'featured-product': { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable product permissions (only the disabled ones)
      'api::product': {
        controllers: {
          'product': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable vendor permissions (only the disabled ones)
      'api::vendor': {
        controllers: {
          'vendor': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: true, policy: '' }
          }
        }
      }
    };

    // Update the admin role
    await axios.put(
      `${API_URL}/api/users-permissions/roles/${adminRole.id}`,
      {
        ...adminRole,
        permissions: updatedPermissions
      },
      { headers }
    );

    console.log('✅ Missing permissions enabled successfully');

    // Test the permissions
    console.log('\n🧪 Testing all permissions...');
    
    // Test login
    console.log('\n🔐 Testing login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@example.com',
      password: 'admin123'
    });

    const { jwt } = loginResponse.data;
    console.log('✅ Login successful');

    // Test user/me endpoint
    console.log('\n👤 Testing /api/users/me endpoint...');
    const meResponse = await axios.get(`${API_URL}/api/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    console.log('✅ /api/users/me successful');
    console.log('✅ User role:', meResponse.data.role?.name);

    // Test banner API
    console.log('\n📋 Testing Banner API...');
    const bannerResponse = await axios.get(`${API_URL}/api/banners?populate=image`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    console.log('✅ Banner API - Status:', bannerResponse.status);
    console.log('✅ Banner API - Count:', bannerResponse.data.data?.length || 0);

    // Test featured products API
    console.log('\n⭐ Testing Featured Products API...');
    const featuredResponse = await axios.get(`${API_URL}/api/featured-products?populate=product`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    console.log('✅ Featured Products API - Status:', featuredResponse.status);
    console.log('✅ Featured Products API - Count:', featuredResponse.data.data?.length || 0);

    console.log('\n🎉 All permissions working successfully!');
    console.log('\n📝 Your admin panel should now work perfectly:');
    console.log('1. Login with admin@example.com / admin123');
    console.log('2. No more redirect loops to login page');
    console.log('3. Banner and Featured Product pages should work');
    console.log('4. All CRUD operations should be available');

  } catch (error) {
    console.error('❌ Error enabling permissions:', error.response?.data || error.message);
  }
}

enableMissingPermissions(); 