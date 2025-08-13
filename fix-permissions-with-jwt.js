const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function getJWTToken() {
  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin123!'
    });
    return loginResponse.data.jwt;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function enableAllPermissions() {
  console.log('🔧 Enabling all necessary permissions for admin role...');

  try {
    const jwt = await getJWTToken();
    if (!jwt) {
      console.error('❌ Failed to get JWT token');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };

    // Get current admin role
    const roleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/4`, { headers });
    const adminRole = roleResponse.data.role;
    
    console.log('✅ Found admin role, updating permissions...');

    // Enable all necessary permissions
    const updatedPermissions = {
      ...adminRole.permissions,
      
      // Enable banner permissions
      'api::banner.banner': {
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
      
      // Enable featured product permissions
      'api::featured-product.featured-product': {
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
      
      // Enable product permissions
      'api::product.product': {
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
      
      // Enable vendor permissions
      'api::vendor.vendor': {
        controllers: {
          'vendor': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable category permissions
      'api::category.category': {
        controllers: {
          'category': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable order permissions
      'api::order.order': {
        controllers: {
          'order': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable user permissions (CRITICAL for authentication)
      'plugin::users-permissions.user': {
        controllers: {
          'user': {
            me: { enabled: true, policy: '' },
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            count: { enabled: true, policy: '' },
            destroy: { enabled: true, policy: '' },
            user: { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable auth permissions
      'plugin::users-permissions.auth': {
        controllers: {
          'auth': {
            callback: { enabled: true, policy: '' },
            changePassword: { enabled: true, policy: '' },
            connect: { enabled: true, policy: '' },
            emailConfirmation: { enabled: true, policy: '' },
            forgotPassword: { enabled: true, policy: '' },
            register: { enabled: true, policy: '' },
            resetPassword: { enabled: true, policy: '' },
            sendEmailConfirmation: { enabled: true, policy: '' },
            auth: { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable upload permissions
      'plugin::upload.upload': {
        controllers: {
          'upload': {
            upload: { enabled: true, policy: '' },
            uploadFiles: { enabled: true, policy: '' },
            upload: { enabled: true, policy: '' }
          }
        }
      }
    };

    // Update the admin role
    const updateResponse = await axios.put(`${API_URL}/api/users-permissions/roles/4`, {
      ...adminRole,
      permissions: updatedPermissions
    }, { headers });

    console.log('✅ Admin role permissions updated successfully!');
    console.log('🎉 All necessary permissions are now enabled!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error enabling permissions:', error.response?.data || error.message);
    return false;
  }
}

// Run the script
enableAllPermissions().then(success => {
  if (success) {
    console.log('🎉 Permission setup completed successfully!');
    console.log('🔧 You can now run the seed scripts.');
  } else {
    console.log('💥 Permission setup failed.');
  }
}); 