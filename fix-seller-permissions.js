const axios = require('axios');

const API_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzU1MDE5NzM1LCJleHAiOjE3NTc2MTE3MzV9.HcLcM14uLoGiOyyzaVsIuy-MamT2z7dNsJnP57zfvLY';

const headers = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json'
};

async function fixSellerPermissions() {
  console.log('🔧 Fixing seller permissions...');

  try {
    // Get current seller role
    const roleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/3`, { headers });
    const sellerRole = roleResponse.data.role;
    
    console.log('✅ Found seller role, updating permissions...');

    // Enable necessary permissions for sellers
    const updatedPermissions = {
      ...sellerRole.permissions,
      
      // Enable user permissions (CRITICAL for authentication)
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
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            count: { enabled: true, policy: '' },
            destroy: { enabled: true, policy: '' }
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
      },
      
      // Enable product permissions (sellers need to manage their products)
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
      
      // Enable vendor permissions (sellers need to access their vendor info)
      'api::vendor': {
        controllers: {
          'vendor': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: false, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: false, policy: '' }
          }
        }
      },
      
      // Enable order permissions (sellers need to see orders)
      'api::order': {
        controllers: {
          'order': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            delete: { enabled: false, policy: '' }
          }
        }
      },
      
      // Enable category permissions (sellers need to see categories)
      'api::category': {
        controllers: {
          'category': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: false, policy: '' },
            update: { enabled: false, policy: '' },
            delete: { enabled: false, policy: '' }
          }
        }
      },
      
      // Enable upload permissions (sellers need to upload product images)
      'plugin::upload': {
        controllers: {
          'content-api': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            destroy: { enabled: true, policy: '' },
            upload: { enabled: true, policy: '' }
          }
        }
      },
      
      // Enable banner permissions (read only for sellers)
      'api::banner': {
        controllers: {
          'banner': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: false, policy: '' },
            update: { enabled: false, policy: '' },
            delete: { enabled: false, policy: '' }
          }
        }
      },
      
      // Enable featured product permissions (read only for sellers)
      'api::featured-product': {
        controllers: {
          'featured-product': {
            find: { enabled: true, policy: '' },
            findOne: { enabled: true, policy: '' },
            create: { enabled: false, policy: '' },
            update: { enabled: false, policy: '' },
            delete: { enabled: false, policy: '' }
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
      { headers }
    );

    console.log('✅ Seller role permissions updated successfully');

    // Test seller login
    console.log('\n🧪 Testing seller login...');
    
    // Test with a seller account
    console.log('\n🔐 Testing seller login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'seller1@example.com',
      password: 'seller123'
    });

    const { jwt } = loginResponse.data;
    console.log('✅ Seller login successful');

    // Test user/me endpoint
    console.log('\n👤 Testing /api/users/me endpoint...');
    const meResponse = await axios.get(`${API_URL}/api/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    console.log('✅ /api/users/me successful');
    console.log('✅ User role:', meResponse.data.role?.name);

    // Test product API (sellers should be able to access products)
    console.log('\n📦 Testing Product API...');
    const productResponse = await axios.get(`${API_URL}/api/products?populate=image`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    console.log('✅ Product API - Status:', productResponse.status);
    console.log('✅ Product API - Count:', productResponse.data.data?.length || 0);

    // Test vendor API (sellers should be able to access vendor info)
    console.log('\n🏪 Testing Vendor API...');
    const vendorResponse = await axios.get(`${API_URL}/api/vendors?populate=*`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    console.log('✅ Vendor API - Status:', vendorResponse.status);
    console.log('✅ Vendor API - Count:', vendorResponse.data.data?.length || 0);

    console.log('\n🎉 Seller permissions fixed successfully!');
    console.log('\n📝 Sellers should now be able to:');
    console.log('1. Login successfully');
    console.log('2. Access their dashboard');
    console.log('3. Manage their products');
    console.log('4. View orders');
    console.log('5. Update their vendor profile');

  } catch (error) {
    console.error('❌ Error fixing seller permissions:', error.response?.data || error.message);
  }
}

fixSellerPermissions(); 