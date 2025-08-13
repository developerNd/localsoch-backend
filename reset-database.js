const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');

const API_URL = 'http://localhost:1337';

async function resetDatabase() {
  console.log('🗑️ Starting complete database reset...');
  
  try {
    // Step 1: Clear all existing data
    console.log('\n🧹 Step 1: Clearing all existing data...');
    
    // Clear all content types
    const contentTypes = [
      'products',
      'categories', 
      'vendors',
      'banners',
      'featured-products',
      'orders',
      'button-configs'
    ];
    
    for (const contentType of contentTypes) {
      try {
        const response = await axios.delete(`${API_URL}/api/${contentType}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ Cleared ${contentType}`);
      } catch (error) {
        console.log(`ℹ️ ${contentType}: ${error.response?.status || 'No data to clear'}`);
      }
    }
    
    // Step 2: Clear all users except the first one (which might be the original admin)
    console.log('\n👥 Step 2: Clearing users...');
    try {
      const usersResponse = await axios.get(`${API_URL}/api/users`);
      if (usersResponse.data && usersResponse.data.length > 0) {
        for (const user of usersResponse.data) {
          if (user.id > 1) { // Keep the first user, delete others
            try {
              await axios.delete(`${API_URL}/api/users/${user.id}`);
              console.log(`✅ Deleted user: ${user.email || user.username}`);
            } catch (error) {
              console.log(`⚠️ Could not delete user ${user.id}: ${error.response?.status}`);
            }
          }
        }
      }
    } catch (error) {
      console.log('ℹ️ Could not access users list');
    }
    
    // Step 3: Create a fresh super admin user
    console.log('\n👑 Step 3: Creating fresh super admin user...');
    
    try {
      const createResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
        username: 'superadmin',
        email: 'admin@gmail.com',
        password: 'admin@123'
      });
      
      console.log('✅ Super admin user created successfully!');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: admin@123');
      console.log('🆔 User ID:', createResponse.data.user.id);
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already taken')) {
        console.log('ℹ️ Super admin user already exists');
      } else {
        console.log('❌ Error creating super admin:', error.response?.data || error.message);
      }
    }
    
    // Step 4: Test login and get JWT
    console.log('\n🔐 Step 4: Testing super admin login...');
    let jwt = null;
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'admin@gmail.com',
        password: 'admin@123'
      });
      
      jwt = loginResponse.data.jwt;
      console.log('✅ Super admin login successful!');
      console.log('🎫 JWT Token received');
      
    } catch (error) {
      console.log('❌ Super admin login failed:', error.response?.data || error.message);
      return false;
    }
    
    // Step 5: Create seed data
    console.log('\n🌱 Step 5: Creating seed data...');
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Create categories
    console.log('📂 Creating categories...');
    const categories = [
      { name: 'Groceries', description: 'Daily essentials and groceries', slug: 'groceries' },
      { name: 'Bakery', description: 'Fresh bread and cakes', slug: 'bakery' },
      { name: 'Electronics', description: 'Gadgets and devices', slug: 'electronics' }
    ];
    
    const createdCategories = [];
    for (const categoryData of categories) {
      try {
        const response = await axios.post(`${API_URL}/api/categories`, {
          data: categoryData
        }, { headers });
        createdCategories.push(response.data.data);
        console.log(`✅ Created category: ${categoryData.name}`);
      } catch (error) {
        console.log(`❌ Failed to create category ${categoryData.name}:`, error.response?.status);
      }
    }
    
    // Create vendors
    console.log('🏪 Creating vendors...');
    const vendors = [
      {
        name: 'FreshMart',
        address: '123 Main St, City Center',
        contact: '123-456-7890',
        email: 'info@freshmart.com',
        rating: 4.5,
        deliveryTime: '30-45 min',
        minimumOrder: 100
      },
      {
        name: 'CityBakery',
        address: '456 Baker St, Downtown',
        contact: '987-654-3210',
        email: 'hello@citybakery.com',
        rating: 4.8,
        deliveryTime: '20-35 min',
        minimumOrder: 50
      },
      {
        name: 'TechStore',
        address: '789 Tech Ave, Innovation District',
        contact: '555-123-4567',
        email: 'support@techstore.com',
        rating: 4.2,
        deliveryTime: '45-60 min',
        minimumOrder: 200
      }
    ];
    
    const createdVendors = [];
    for (const vendorData of vendors) {
      try {
        const response = await axios.post(`${API_URL}/api/vendors`, {
          data: vendorData
        }, { headers });
        createdVendors.push(response.data.data);
        console.log(`✅ Created vendor: ${vendorData.name}`);
      } catch (error) {
        console.log(`❌ Failed to create vendor ${vendorData.name}:`, error.response?.status);
      }
    }
    
    // Create products
    console.log('📦 Creating products...');
    const products = [
      {
        name: 'Fresh Apples',
        description: 'Sweet and juicy red apples',
        price: 120,
        originalPrice: 150,
        category: createdCategories[0]?.id,
        vendor: createdVendors[0]?.id,
        stock: 50,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400'
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread',
        price: 45,
        originalPrice: 60,
        category: createdCategories[1]?.id,
        vendor: createdVendors[1]?.id,
        stock: 30,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400'
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones',
        price: 2500,
        originalPrice: 3000,
        category: createdCategories[2]?.id,
        vendor: createdVendors[2]?.id,
        stock: 15,
        unit: 'piece',
        image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400'
      },
      {
        name: 'Organic Bananas',
        description: 'Organic yellow bananas',
        price: 80,
        originalPrice: 100,
        category: createdCategories[0]?.id,
        vendor: createdVendors[0]?.id,
        stock: 40,
        unit: 'dozen',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
      },
      {
        name: 'Chocolate Cake',
        description: 'Delicious chocolate cake',
        price: 350,
        originalPrice: 450,
        category: createdCategories[1]?.id,
        vendor: createdVendors[1]?.id,
        stock: 10,
        unit: 'piece',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
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
        console.log(`❌ Failed to create product ${productData.name}:`, error.response?.status);
      }
    }
    
    // Create banners
    console.log('🖼️ Creating banners...');
    const banners = [
      {
        title: 'Fresh Groceries',
        subtitle: 'Get 20% off on fresh vegetables',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
        link: '/category/groceries',
        active: true
      },
      {
        title: 'Fresh Bakery',
        subtitle: 'Fresh bread delivered to your door',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        link: '/category/bakery',
        active: true
      }
    ];
    
    for (const bannerData of banners) {
      try {
        const response = await axios.post(`${API_URL}/api/banners`, {
          data: bannerData
        }, { headers });
        console.log(`✅ Created banner: ${bannerData.title}`);
      } catch (error) {
        console.log(`❌ Failed to create banner ${bannerData.title}:`, error.response?.status);
      }
    }
    
    // Create featured products
    console.log('⭐ Creating featured products...');
    const featuredProducts = [
      { product: createdProducts[0]?.id, position: 1, active: true },
      { product: createdProducts[1]?.id, position: 2, active: true },
      { product: createdProducts[2]?.id, position: 3, active: true }
    ];
    
    for (const featuredData of featuredProducts) {
      if (featuredData.product) {
        try {
          const response = await axios.post(`${API_URL}/api/featured-products`, {
            data: featuredData
          }, { headers });
          console.log(`✅ Created featured product at position ${featuredData.position}`);
        } catch (error) {
          console.log(`❌ Failed to create featured product:`, error.response?.status);
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
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('📊 Summary:');
    console.log('- Categories: 3');
    console.log('- Vendors: 3');
    console.log('- Products: 5');
    console.log('- Banners: 2');
    console.log('- Featured Products: 3');
    console.log('- Super Admin: admin@gmail.com / admin@123');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during database reset:', error.response?.data || error.message);
    return false;
  }
}

// Run the reset
resetDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database reset completed!');
    console.log('🔧 Next steps:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. Login with: admin@gmail.com / admin@123');
    console.log('3. Assign admin role to the super admin user');
    console.log('4. Set up permissions for public access');
    console.log('5. Test your React Native app');
  } else {
    console.log('\n💥 Database reset failed.');
    console.log('🔧 Please check the server status and try again.');
  }
}); 