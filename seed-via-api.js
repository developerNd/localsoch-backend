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

async function seedViaAPI() {
  console.log('🌱 Starting API-based seed...');
  
  const jwt = await getJWTToken();
  if (!jwt) {
    console.error('❌ Failed to get JWT token');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Clear existing data (if any)
    console.log('🧹 Clearing existing data...');
    try {
      await axios.delete(`${API_URL}/api/products`, { headers });
      await axios.delete(`${API_URL}/api/categories`, { headers });
      await axios.delete(`${API_URL}/api/vendors`, { headers });
      await axios.delete(`${API_URL}/api/banners`, { headers });
      await axios.delete(`${API_URL}/api/featured-products`, { headers });
    } catch (error) {
      console.log('ℹ️ No existing data to clear or permission denied');
    }
    
    // Create categories
    console.log('📂 Creating categories...');
    const categories = [
      { name: 'Groceries', description: 'Daily essentials and groceries', slug: 'groceries' },
      { name: 'Bakery', description: 'Fresh bread and cakes', slug: 'bakery' },
      { name: 'Electronics', description: 'Gadgets and devices', slug: 'electronics' }
    ];
    
    const createdCategories = [];
    for (const categoryData of categories) {
      const response = await axios.post(`${API_URL}/api/categories`, {
        data: categoryData
      }, { headers });
      createdCategories.push(response.data.data);
      console.log(`✅ Created category: ${categoryData.name}`);
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
      const response = await axios.post(`${API_URL}/api/vendors`, {
        data: vendorData
      }, { headers });
      createdVendors.push(response.data.data);
      console.log(`✅ Created vendor: ${vendorData.name}`);
    }
    
    // Create products
    console.log('📦 Creating products...');
    const products = [
      {
        name: 'Fresh Apples',
        description: 'Sweet and juicy red apples',
        price: 120,
        originalPrice: 150,
        category: createdCategories[0].id,
        vendor: createdVendors[0].id,
        stock: 50,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400'
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread',
        price: 45,
        originalPrice: 60,
        category: createdCategories[1].id,
        vendor: createdVendors[1].id,
        stock: 30,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400'
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones',
        price: 2500,
        originalPrice: 3000,
        category: createdCategories[2].id,
        vendor: createdVendors[2].id,
        stock: 15,
        unit: 'piece',
        image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400'
      },
      {
        name: 'Organic Bananas',
        description: 'Organic yellow bananas',
        price: 80,
        originalPrice: 100,
        category: createdCategories[0].id,
        vendor: createdVendors[0].id,
        stock: 40,
        unit: 'dozen',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
      },
      {
        name: 'Chocolate Cake',
        description: 'Delicious chocolate cake',
        price: 350,
        originalPrice: 450,
        category: createdCategories[1].id,
        vendor: createdVendors[1].id,
        stock: 10,
        unit: 'piece',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
      }
    ];
    
    const createdProducts = [];
    for (const productData of products) {
      const response = await axios.post(`${API_URL}/api/products`, {
        data: productData
      }, { headers });
      createdProducts.push(response.data.data);
      console.log(`✅ Created product: ${productData.name}`);
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
      const response = await axios.post(`${API_URL}/api/banners`, {
        data: bannerData
      }, { headers });
      console.log(`✅ Created banner: ${bannerData.title}`);
    }
    
    // Create featured products
    console.log('⭐ Creating featured products...');
    const featuredProducts = [
      { product: createdProducts[0].id, position: 1, active: true },
      { product: createdProducts[1].id, position: 2, active: true },
      { product: createdProducts[2].id, position: 3, active: true }
    ];
    
    for (const featuredData of featuredProducts) {
      const response = await axios.post(`${API_URL}/api/featured-products`, {
        data: featuredData
      }, { headers });
      console.log(`✅ Created featured product at position ${featuredData.position}`);
    }
    
    console.log('🎉 Seed completed successfully!');
    console.log('📊 Summary:');
    console.log('- Categories: 3');
    console.log('- Vendors: 3');
    console.log('- Products: 5');
    console.log('- Banners: 2');
    console.log('- Featured Products: 3');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.response?.data || error.message);
  }
}

seedViaAPI(); 