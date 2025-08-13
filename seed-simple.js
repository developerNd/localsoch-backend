'use strict';

const { createStrapi } = require('@strapi/strapi');

async function seedSimple() {
  const strapi = await createStrapi();
  await strapi.start();
  
  console.log('🌱 Starting simple seed...');
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await strapi.db.query('api::product.product').deleteMany({});
    await strapi.db.query('api::category.category').deleteMany({});
    await strapi.db.query('api::vendor.vendor').deleteMany({});
    await strapi.db.query('api::banner.banner').deleteMany({});
    await strapi.db.query('api::featured-product.featured-product').deleteMany({});
    
    // Create categories
    console.log('📂 Creating categories...');
    const groceries = await strapi.entityService.create('api::category.category', {
      data: { 
        name: 'Groceries', 
        description: 'Daily essentials and groceries',
        slug: 'groceries'
      }
    });
    
    const bakery = await strapi.entityService.create('api::category.category', {
      data: { 
        name: 'Bakery', 
        description: 'Fresh bread and cakes',
        slug: 'bakery'
      }
    });
    
    const electronics = await strapi.entityService.create('api::category.category', {
      data: { 
        name: 'Electronics', 
        description: 'Gadgets and devices',
        slug: 'electronics'
      }
    });
    
    console.log('✅ Categories created:', { groceries: groceries.id, bakery: bakery.id, electronics: electronics.id });
    
    // Create vendors
    console.log('🏪 Creating vendors...');
    const freshMart = await strapi.entityService.create('api::vendor.vendor', {
      data: { 
        name: 'FreshMart', 
        address: '123 Main St, City Center',
        contact: '123-456-7890',
        email: 'info@freshmart.com',
        rating: 4.5,
        deliveryTime: '30-45 min',
        minimumOrder: 100
      }
    });
    
    const cityBakery = await strapi.entityService.create('api::vendor.vendor', {
      data: { 
        name: 'CityBakery', 
        address: '456 Baker St, Downtown',
        contact: '987-654-3210',
        email: 'hello@citybakery.com',
        rating: 4.8,
        deliveryTime: '20-35 min',
        minimumOrder: 50
      }
    });
    
    const techStore = await strapi.entityService.create('api::vendor.vendor', {
      data: { 
        name: 'TechStore', 
        address: '789 Tech Ave, Innovation District',
        contact: '555-123-4567',
        email: 'support@techstore.com',
        rating: 4.2,
        deliveryTime: '45-60 min',
        minimumOrder: 200
      }
    });
    
    console.log('✅ Vendors created:', { freshMart: freshMart.id, cityBakery: cityBakery.id, techStore: techStore.id });
    
    // Create products
    console.log('📦 Creating products...');
    
    const products = [
      {
        name: 'Fresh Apples',
        description: 'Sweet and juicy red apples',
        price: 120,
        originalPrice: 150,
        category: groceries.id,
        vendor: freshMart.id,
        stock: 50,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400'
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread',
        price: 45,
        originalPrice: 60,
        category: bakery.id,
        vendor: cityBakery.id,
        stock: 30,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400'
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones',
        price: 2500,
        originalPrice: 3000,
        category: electronics.id,
        vendor: techStore.id,
        stock: 15,
        unit: 'piece',
        image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400'
      },
      {
        name: 'Organic Bananas',
        description: 'Organic yellow bananas',
        price: 80,
        originalPrice: 100,
        category: groceries.id,
        vendor: freshMart.id,
        stock: 40,
        unit: 'dozen',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
      },
      {
        name: 'Chocolate Cake',
        description: 'Delicious chocolate cake',
        price: 350,
        originalPrice: 450,
        category: bakery.id,
        vendor: cityBakery.id,
        stock: 10,
        unit: 'piece',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
      }
    ];
    
    for (const productData of products) {
      await strapi.entityService.create('api::product.product', {
        data: productData
      });
    }
    
    console.log('✅ Products created successfully!');
    
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
      await strapi.entityService.create('api::banner.banner', {
        data: bannerData
      });
    }
    
    console.log('✅ Banners created successfully!');
    
    // Create featured products
    console.log('⭐ Creating featured products...');
    
    const featuredProducts = [
      {
        product: 1, // Fresh Apples
        position: 1,
        active: true
      },
      {
        product: 2, // Whole Wheat Bread
        position: 2,
        active: true
      },
      {
        product: 3, // Wireless Headphones
        position: 3,
        active: true
      }
    ];
    
    for (const featuredData of featuredProducts) {
      await strapi.entityService.create('api::featured-product.featured-product', {
        data: featuredData
      });
    }
    
    console.log('✅ Featured products created successfully!');
    
    console.log('🎉 Seed completed successfully!');
    console.log('📊 Summary:');
    console.log('- Categories: 3');
    console.log('- Vendors: 3');
    console.log('- Products: 5');
    console.log('- Banners: 2');
    console.log('- Featured Products: 3');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await strapi.destroy();
  }
}

seedSimple(); 