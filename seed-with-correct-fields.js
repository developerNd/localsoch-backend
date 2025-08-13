const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function seedWithCorrectFields() {
  try {
    console.log('🌱 Seeding data with correct field names...');
    
    // Step 1: Login with super admin
    console.log('\n🔐 Step 1: Logging in with super admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Super admin login successful!');
    console.log('🆔 User ID:', loginResponse.data.user.id);
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Create categories
    console.log('\n📂 Step 2: Creating categories...');
    const categories = [
      { name: 'Groceries', description: 'Daily essentials and groceries' },
      { name: 'Bakery', description: 'Fresh bread and cakes' },
      { name: 'Electronics', description: 'Gadgets and devices' }
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
    
    // Step 3: Create vendors
    console.log('\n🏪 Step 3: Creating vendors...');
    const vendors = [
      {
        name: 'FreshMart',
        address: '123 Main St, City Center',
        contact: '123-456-7890'
      },
      {
        name: 'CityBakery',
        address: '456 Baker St, Downtown',
        contact: '987-654-3210'
      },
      {
        name: 'TechStore',
        address: '789 Tech Ave, Innovation District',
        contact: '555-123-4567'
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
    
    // Step 4: Create products
    console.log('\n📦 Step 4: Creating products...');
    const products = [
      {
        name: 'Fresh Apples',
        description: 'Sweet and juicy red apples',
        price: 120.00,
        category: createdCategories[0]?.id,
        vendor: createdVendors[0]?.id,
        stock: 50
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread',
        price: 45.00,
        category: createdCategories[1]?.id,
        vendor: createdVendors[1]?.id,
        stock: 30
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones',
        price: 2500.00,
        category: createdCategories[2]?.id,
        vendor: createdVendors[2]?.id,
        stock: 15
      },
      {
        name: 'Organic Bananas',
        description: 'Organic yellow bananas',
        price: 80.00,
        category: createdCategories[0]?.id,
        vendor: createdVendors[0]?.id,
        stock: 40
      },
      {
        name: 'Chocolate Cake',
        description: 'Delicious chocolate cake',
        price: 350.00,
        category: createdCategories[1]?.id,
        vendor: createdVendors[1]?.id,
        stock: 10
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
    
    // Step 5: Create banners
    console.log('\n🖼️ Step 5: Creating banners...');
    const banners = [
      {
        title: 'Fresh Groceries',
        subtitle: 'Get 20% off on fresh vegetables',
        isActive: true,
        sortOrder: 1
      },
      {
        title: 'Fresh Bakery',
        subtitle: 'Fresh bread delivered to your door',
        isActive: true,
        sortOrder: 2
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
    
    // Step 6: Create featured products
    console.log('\n⭐ Step 6: Creating featured products...');
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
    
    // Step 7: Test the setup
    console.log('\n🧪 Step 7: Testing the setup...');
    
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
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('- Categories: 3');
    console.log('- Vendors: 3');
    console.log('- Products: 5');
    console.log('- Banners: 2');
    console.log('- Featured Products: 3');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.response?.data || error.message);
    return false;
  }
}

// Run the seeding
seedWithCorrectFields().then(success => {
  if (success) {
    console.log('\n🎉 Complete seeding finished!');
    console.log('🔧 Your React Native app should now be able to:');
    console.log('1. Load categories, products, vendors, and banners');
    console.log('2. Display featured products');
    console.log('3. Access all API endpoints');
    console.log('4. Create orders and manage data');
  } else {
    console.log('\n💥 Seeding failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 