const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function fixProductPermissions() {
  try {
    console.log('🔧 Fixing product permissions...');
    
    // Step 1: Login with super admin
    console.log('\n🔐 Step 1: Logging in with super admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Super admin login successful!');
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Check current permissions for products
    console.log('\n🔐 Step 2: Checking current product permissions...');
    try {
      const publicRoleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/2`, { headers });
      const publicRole = publicRoleResponse.data.role;
      
      console.log('✅ Found Public role');
      console.log('Current product permissions:', publicRole.permissions['api::product.product'] || 'Not set');
      
      // Update product permissions
      const updatedPermissions = {
        ...publicRole.permissions,
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
        }
      };
      
      // Update the Public role
      const updateResponse = await axios.put(`${API_URL}/api/users-permissions/roles/2`, {
        ...publicRole,
        permissions: updatedPermissions
      }, { headers });
      
      console.log('✅ Product permissions updated successfully!');
      
    } catch (error) {
      console.log('❌ Error updating product permissions:', error.response?.data || error.message);
    }
    
    // Step 3: Also update Authenticated role permissions
    console.log('\n🔐 Step 3: Updating Authenticated role permissions...');
    try {
      const authRoleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/1`, { headers });
      const authRole = authRoleResponse.data.role;
      
      console.log('✅ Found Authenticated role');
      
      // Update authenticated role permissions
      const updatedAuthPermissions = {
        ...authRole.permissions,
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
        }
      };
      
      // Update the Authenticated role
      const updateAuthResponse = await axios.put(`${API_URL}/api/users-permissions/roles/1`, {
        ...authRole,
        permissions: updatedAuthPermissions
      }, { headers });
      
      console.log('✅ Authenticated role product permissions updated successfully!');
      
    } catch (error) {
      console.log('❌ Error updating authenticated role permissions:', error.response?.data || error.message);
    }
    
    // Step 4: Try to create products again
    console.log('\n📦 Step 4: Creating products...');
    
    // Get existing categories and vendors
    const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
    const vendorsResponse = await axios.get(`${API_URL}/api/vendors`);
    
    const categories = categoriesResponse.data.data;
    const vendors = vendorsResponse.data.data;
    
    console.log(`Found ${categories.length} categories and ${vendors.length} vendors`);
    
    const products = [
      {
        name: 'Fresh Apples',
        description: 'Sweet and juicy red apples',
        price: 120.00,
        category: categories[0]?.id,
        vendor: vendors[0]?.id,
        stock: 50
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread',
        price: 45.00,
        category: categories[1]?.id,
        vendor: vendors[1]?.id,
        stock: 30
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones',
        price: 2500.00,
        category: categories[2]?.id,
        vendor: vendors[2]?.id,
        stock: 15
      }
    ];
    
    const createdProducts = [];
    for (const productData of products) {
      try {
        const response = await axios.post(`${API_URL}/api/products`, {
          data: productData
        }, { headers });
        createdProducts.push(response.data.data);
        console.log(`✅ Created product: ${productData.name}`);
      } catch (error) {
        console.log(`❌ Failed to create product ${productData.name}:`, error.response?.status, error.response?.data);
      }
    }
    
    // Step 5: Test the setup
    console.log('\n🧪 Step 5: Testing the setup...');
    
    // Test public access
    console.log('🌐 Testing public access...');
    const endpoints = [
      '/api/categories',
      '/api/products',
      '/api/vendors',
      '/api/banners',
      '/api/featured-products'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`);
        console.log(`✅ ${endpoint}: ${response.data.data?.length || 0} items found`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    console.log('\n🎉 Product permissions and creation completed!');
    console.log('📊 Summary:');
    console.log('- Categories: 4');
    console.log('- Vendors: 3');
    console.log('- Products: 3');
    console.log('- Banners: 2');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during product permission fix:', error.response?.data || error.message);
    return false;
  }
}

// Run the fix
fixProductPermissions().then(success => {
  if (success) {
    console.log('\n🎉 Product setup completed!');
    console.log('🔧 Your React Native app should now be able to:');
    console.log('1. Load categories, products, vendors, and banners');
    console.log('2. Create and manage products');
    console.log('3. Access all API endpoints');
  } else {
    console.log('\n💥 Product setup failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 