const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function createSellerRole() {
  try {
    console.log('🔧 Creating seller role...');
    
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

    // Create seller role
    const roleData = {
      name: 'seller',
      description: 'Seller role for vendors',
      type: 'authenticated',
      permissions: {
        // Basic permissions for sellers
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
        'api::vendor.vendor': {
          controllers: {
            'vendor': {
              find: { enabled: true, policy: '' },
              findOne: { enabled: true, policy: '' },
              update: { enabled: true, policy: '' }
            }
          }
        },
        'api::order.order': {
          controllers: {
            'order': {
              find: { enabled: true, policy: '' },
              findOne: { enabled: true, policy: '' },
              update: { enabled: true, policy: '' }
            }
          }
        }
      }
    };

    const roleResponse = await axios.post(`${API_URL}/api/users-permissions/roles`, roleData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (roleResponse.data.role) {
      console.log('✅ Seller role created successfully!');
      console.log('   Role ID:', roleResponse.data.role.id);
      console.log('   Role Name:', roleResponse.data.role.name);
      console.log('   Role Type:', roleResponse.data.role.type);
      
      return roleResponse.data.role.id;
    } else {
      throw new Error('Failed to create seller role');
    }

  } catch (error) {
    console.error('❌ Error creating seller role:', error.response?.data || error.message);
    return null;
  }
}

// Run the script
createSellerRole().then(roleId => {
  if (roleId) {
    console.log('\n🎉 Seller role setup completed!');
    console.log('📝 Role ID for future reference:', roleId);
    console.log('🔧 Now sellers can be assigned this role during registration');
  } else {
    console.log('\n💥 Seller role setup failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 