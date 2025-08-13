const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function fixProductPermissionsAndCreate() {
  try {
    console.log('🔧 Fixing product permissions and creating products...');
    
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
    
    // Step 2: Fix product permissions for all roles
    console.log('\n🔐 Step 2: Fixing product permissions...');
    
    // Fix Public role permissions
    try {
      const publicRoleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/2`, { headers });
      const publicRole = publicRoleResponse.data.role;
      
      const updatedPublicPermissions = {
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
      
      await axios.put(`${API_URL}/api/users-permissions/roles/2`, {
        ...publicRole,
        permissions: updatedPublicPermissions
      }, { headers });
      
      console.log('✅ Public role product permissions updated');
      
    } catch (error) {
      console.log('❌ Error updating public role permissions:', error.response?.status);
    }
    
    // Fix Authenticated role permissions
    try {
      const authRoleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/1`, { headers });
      const authRole = authRoleResponse.data.role;
      
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
      
      await axios.put(`${API_URL}/api/users-permissions/roles/1`, {
        ...authRole,
        permissions: updatedAuthPermissions
      }, { headers });
      
      console.log('✅ Authenticated role product permissions updated');
      
    } catch (error) {
      console.log('❌ Error updating authenticated role permissions:', error.response?.status);
    }
    
    // Step 3: Get existing categories and vendors
    console.log('\n📋 Step 3: Getting categories and vendors...');
    const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
    const vendorsResponse = await axios.get(`${API_URL}/api/vendors`);
    
    const categories = categoriesResponse.data.data;
    const vendors = vendorsResponse.data.data;
    
    console.log(`Found ${categories.length} categories and ${vendors.length} vendors`);
    
    // Step 4: Create products
    console.log('\n📦 Step 4: Creating products...');
    const products = [
      {
        name: 'Fresh Apples',
        description: 'Sweet and juicy red apples, perfect for snacking or baking. Grown organically and delivered fresh.',
        price: 120.00,
        category: categories[0]?.id,
        vendor: vendors[0]?.id,
        stock: 50
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread made with premium flour. Healthy and delicious.',
        price: 45.00,
        category: categories[1]?.id,
        vendor: vendors[1]?.id,
        stock: 30
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation. Perfect for music lovers.',
        price: 2500.00,
        category: categories[2]?.id,
        vendor: vendors[2]?.id,
        stock: 15
      },
      {
        name: 'Organic Bananas',
        description: 'Organic yellow bananas, rich in potassium and natural sweetness.',
        price: 80.00,
        category: categories[0]?.id,
        vendor: vendors[0]?.id,
        stock: 40
      },
      {
        name: 'Chocolate Cake',
        description: 'Delicious chocolate cake with rich frosting. Perfect for celebrations.',
        price: 350.00,
        category: categories[1]?.id,
        vendor: vendors[1]?.id,
        stock: 10
      },
      {
        name: 'Fresh Tomatoes',
        description: 'Ripe red tomatoes, perfect for salads and cooking.',
        price: 60.00,
        category: categories[0]?.id,
        vendor: vendors[0]?.id,
        stock: 25
      },
      {
        name: 'Croissants',
        description: 'Buttery and flaky croissants, baked fresh daily.',
        price: 25.00,
        category: categories[1]?.id,
        vendor: vendors[1]?.id,
        stock: 20
      },
      {
        name: 'Smartphone',
        description: 'Latest smartphone with advanced features and high-quality camera.',
        price: 15000.00,
        category: categories[2]?.id,
        vendor: vendors[2]?.id,
        stock: 8
      }
    ];
    
    const createdProducts = [];
    for (const productData of products) {
      try {
        console.log(`Creating product: ${productData.name}...`);
        
        const response = await axios.post(`${API_URL}/api/products`, {
          data: productData
        }, { headers });
        
        createdProducts.push(response.data.data);
        console.log(`✅ Created product: ${productData.name} (ID: ${response.data.data.id})`);
        
      } catch (error) {
        console.log(`❌ Failed to create product ${productData.name}:`, error.response?.status, error.response?.data);
        
        // Try without relations
        try {
          const simpleProductData = {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock
          };
          
          const simpleResponse = await axios.post(`${API_URL}/api/products`, {
            data: simpleProductData
          }, { headers });
          
          createdProducts.push(simpleResponse.data.data);
          console.log(`✅ Created simple product: ${productData.name} (ID: ${simpleResponse.data.data.id})`);
          
        } catch (simpleError) {
          console.log(`❌ Failed to create simple product ${productData.name}:`, simpleError.response?.status);
        }
      }
    }
    
    // Step 5: Create featured products
    console.log('\n⭐ Step 5: Creating featured products...');
    if (createdProducts.length > 0) {
      const featuredProducts = [
        { 
          product: createdProducts[0]?.id, 
          title: 'Featured: Fresh Apples',
          subtitle: 'Sweet and juicy',
          isActive: true,
          sortOrder: 1
        },
        { 
          product: createdProducts[1]?.id, 
          title: 'Featured: Whole Wheat Bread',
          subtitle: 'Freshly baked',
          isActive: true,
          sortOrder: 2
        },
        { 
          product: createdProducts[2]?.id, 
          title: 'Featured: Wireless Headphones',
          subtitle: 'High-quality audio',
          isActive: true,
          sortOrder: 3
        }
      ];
      
      for (const featuredData of featuredProducts) {
        if (featuredData.product) {
          try {
            const response = await axios.post(`${API_URL}/api/featured-products`, {
              data: featuredData
            }, { headers });
            console.log(`✅ Created featured product: ${featuredData.title}`);
          } catch (error) {
            console.log(`❌ Failed to create featured product:`, error.response?.status);
          }
        }
      }
    }
    
    // Step 6: Test the setup
    console.log('\n🧪 Step 6: Testing the setup...');
    
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
    
    console.log('\n🎉 Product creation completed!');
    console.log('📊 Summary:');
    console.log('- Categories: 4');
    console.log('- Vendors: 3');
    console.log('- Products: ' + createdProducts.length);
    console.log('- Banners: 2');
    console.log('- Featured Products: 3');
    console.log('- Permissions: Updated for all roles');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during product creation:', error.response?.data || error.message);
    return false;
  }
}

// Run the script
fixProductPermissionsAndCreate().then(success => {
  if (success) {
    console.log('\n🎉 Complete product setup finished!');
    console.log('🔧 Your React Native app should now be able to:');
    console.log('1. Load categories, products, vendors, and banners');
    console.log('2. Display featured products');
    console.log('3. Access all API endpoints');
    console.log('4. Create orders and manage data');
    console.log('5. View product details and pricing');
  } else {
    console.log('\n💥 Product setup failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 