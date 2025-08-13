const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@strapi.io';
const ADMIN_PASSWORD = 'Admin123!';

async function setupOrderPermissions() {
  try {
    console.log('🔐 Setting up order permissions...');
    
    // Step 1: Login as admin
    console.log('📝 Logging in as admin...');
    const loginResponse = await axios.post(`${STRAPI_URL}/api/auth/local`, {
      identifier: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = loginResponse.data.jwt;
    console.log('✅ Admin login successful');
    
    // Step 2: Get current permissions
    console.log('📋 Getting current permissions...');
    const permissionsResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Current roles retrieved');
    
    // Step 3: Update Authenticated role permissions
    console.log('🔧 Updating Authenticated role permissions...');
    const authenticatedRole = permissionsResponse.data.roles.find(role => role.type === 'authenticated');
    
    if (!authenticatedRole) {
      throw new Error('Authenticated role not found');
    }
    
    // Add order permissions to the authenticated role
    const updatedPermissions = {
      ...authenticatedRole.permissions,
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
      }
    };
    
    // Update the role
    const updateResponse = await axios.put(`${STRAPI_URL}/api/users-permissions/roles/${authenticatedRole.id}`, {
      ...authenticatedRole,
      permissions: updatedPermissions
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Authenticated role permissions updated');
    
    // Step 4: Test the permissions
    console.log('🧪 Testing order permissions...');
    
    // Create a test user
    const testUserResponse = await axios.post(`${STRAPI_URL}/api/auth/local/register`, {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'Test123!'
    });
    
    const testUserToken = testUserResponse.data.jwt;
    console.log('✅ Test user created');
    
    // Test order creation
    const testOrder = {
      orderNumber: `TEST-${Date.now()}`,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 98765 43210',
      totalAmount: 100.00,
      status: 'pending',
      orderItems: [
        {
          productId: 1,
          quantity: 1,
          totalAmount: 100.00,
          productName: 'Test Product'
        }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      notes: 'Test order',
      vendor: 26,
      user: testUserResponse.data.user.id
    };
    
    const createOrderResponse = await axios.post(`${STRAPI_URL}/api/orders`, {
      data: testOrder
    }, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Order creation test successful');
    console.log('📋 Created order ID:', createOrderResponse.data.data.id);
    
    // Test order retrieval
    const getOrdersResponse = await axios.get(`${STRAPI_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    
    console.log('✅ Order retrieval test successful');
    console.log('📋 Found orders:', getOrdersResponse.data.data.length);
    
    console.log('🎉 Order permissions setup completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error setting up permissions:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('🔧 Authentication failed. Please check admin credentials.');
    } else if (error.response?.status === 403) {
      console.error('🔧 Permission denied. Please check admin permissions.');
    } else if (error.response?.status === 404) {
      console.error('🔧 API endpoint not found. Please check Strapi configuration.');
    }
    
    return false;
  }
}

// Run the setup
setupOrderPermissions().then(success => {
  if (success) {
    console.log('🚀 Ready to test order creation from React Native app!');
  } else {
    console.log('💥 Permission setup failed. Please check the errors above.');
  }
}); 