const axios = require('axios');

const API_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

const headers = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json'
};

async function setupPermissions() {
  console.log('🔧 Setting up permissions for banners and featured products...');

  try {
    // Get all roles
    const rolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`, { headers });
    const roles = rolesResponse.data.roles;
    
    console.log('Found roles:', roles.map(r => r.name));

    // Find admin role
    const adminRole = roles.find(role => role.name === 'admin');
    if (!adminRole) {
      console.log('❌ Admin role not found');
      return;
    }

    console.log('✅ Found admin role, updating permissions...');

    // Update admin role permissions for banners
    const bannerPermissions = {
      ...adminRole.permissions,
      'api::banner.banner': {
        controllers: {
          'banner': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: true, policy: '' }
          }
        }
      },
      'api::featured-product.featured-product': {
        controllers: {
          'featured-product': {
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
    const updateResponse = await axios.put(
      `${API_URL}/api/users-permissions/roles/${adminRole.id}`,
      {
        ...adminRole,
        permissions: bannerPermissions
      },
      { headers }
    );

    console.log('✅ Admin role permissions updated successfully');

    // Also update authenticated role if it exists (check both cases)
    const authenticatedRole = roles.find(role => role.name === 'authenticated' || role.name === 'Authenticated');
    if (authenticatedRole) {
      console.log('✅ Found authenticated role, updating permissions...');
      
      const authenticatedPermissions = {
        ...authenticatedRole.permissions,
        'api::banner.banner': {
          controllers: {
            'banner': {
              find: { enabled: true, policy: '' },
              findOne: { enabled: true, policy: '' }
            }
          }
        },
        'api::featured-product.featured-product': {
          controllers: {
            'featured-product': {
              find: { enabled: true, policy: '' },
              findOne: { enabled: true, policy: '' }
            }
          }
        }
      };

      await axios.put(
        `${API_URL}/api/users-permissions/roles/${authenticatedRole.id}`,
        {
          ...authenticatedRole,
          permissions: authenticatedPermissions
        },
        { headers }
      );

      console.log('✅ Authenticated role permissions updated successfully');
    }

    // Also update seller role if it exists
    const sellerRole = roles.find(role => role.name === 'seller');
    if (sellerRole) {
      console.log('✅ Found seller role, updating permissions...');
      
      const sellerPermissions = {
        ...sellerRole.permissions,
        'api::banner.banner': {
          controllers: {
            'banner': {
              find: { enabled: true, policy: '' },
              findOne: { enabled: true, policy: '' }
            }
          }
        },
        'api::featured-product.featured-product': {
          controllers: {
            'featured-product': {
              find: { enabled: true, policy: '' },
              findOne: { enabled: true, policy: '' }
            }
          }
        }
      };

      await axios.put(
        `${API_URL}/api/users-permissions/roles/${sellerRole.id}`,
        {
          ...sellerRole,
          permissions: sellerPermissions
        },
        { headers }
      );

      console.log('✅ Seller role permissions updated successfully');
    }

    console.log('🎉 All permissions set up successfully!');
    
    // Test the permissions
    console.log('\n🧪 Testing permissions...');
    
    // Test with a user token (you'll need to get a real user token)
    console.log('📝 Note: To test with user authentication, you need to:');
    console.log('1. Login as a user in your admin panel');
    console.log('2. Check if the banner and featured product APIs work');
    console.log('3. The admin role should now have full access to these APIs');

  } catch (error) {
    console.error('❌ Error setting up permissions:', error.response?.data || error.message);
  }
}

setupPermissions(); 