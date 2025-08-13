const axios = require('axios');

const API_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU1MDA1NzkyLCJleHAiOjE3NTc1OTc3OTJ9.xccywGmyeOVI24XgE48zwOT1_Qiw_LHAV6qOQcpy9mc';

const headers = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json'
};

async function checkServerStatus() {
  try {
    const response = await axios.get(`${API_URL}/api/products?pagination[limit]=1`, { headers });
    console.log('✅ Server is running and accessible');
    return true;
  } catch (error) {
    console.log('❌ Server is not accessible:', error.message);
    return false;
  }
}

async function seedBanners() {
  console.log('🌅 Seeding banners...');
  
  const banners = [
    {
      title: 'Flash Sale',
      subtitle: 'Up to 70% Off',
      description: 'Limited time offers on electronics',
      backgroundColor: '#ef4444',
      textColor: '#ffffff',
      actionText: 'Shop Now',
      actionType: 'product_list',
      actionData: { section: 'flash-sale', title: 'Flash Sale' },
      isActive: true,
      sortOrder: 1,
      targetAudience: 'all'
    },
    {
      title: 'New Arrivals',
      subtitle: 'Fresh Collection',
      description: 'Discover the latest fashion trends',
      backgroundColor: '#8b5cf6',
      textColor: '#ffffff',
      actionText: 'Explore',
      actionType: 'product_list',
      actionData: { section: 'new-arrivals', title: 'New Arrivals' },
      isActive: true,
      sortOrder: 2,
      targetAudience: 'all'
    },
    {
      title: 'Free Delivery',
      subtitle: 'On Orders Above ₹499',
      description: 'No delivery charges on your first order',
      backgroundColor: '#22c55e',
      textColor: '#ffffff',
      actionText: 'Order Now',
      actionType: 'cart',
      actionData: {},
      isActive: true,
      sortOrder: 3,
      targetAudience: 'new_users'
    },
    {
      title: 'Weekend Special',
      subtitle: 'Extra 20% Off',
      description: 'Use code WEEKEND20 for additional discount',
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      actionText: 'Get Code',
      actionType: 'product_list',
      actionData: { section: 'weekend-special', title: 'Weekend Special' },
      isActive: true,
      sortOrder: 4,
      targetAudience: 'all'
    },
    {
      title: 'Premium Brands',
      subtitle: 'Exclusive Collection',
      description: 'Shop from top international brands',
      backgroundColor: '#0ea5e9',
      textColor: '#ffffff',
      actionText: 'View Brands',
      actionType: 'product_list',
      actionData: { section: 'premium-brands', title: 'Premium Brands' },
      isActive: true,
      sortOrder: 5,
      targetAudience: 'premium_users'
    }
  ];

  let createdCount = 0;
  for (const banner of banners) {
    try {
      const response = await axios.post(`${API_URL}/api/banners`, { data: banner }, { headers });
      console.log(`✅ Created banner: ${banner.title}`);
      createdCount++;
    } catch (error) {
      console.log(`❌ Error creating banner ${banner.title}:`, error.response?.data?.error?.message || error.message);
    }
  }
  
  console.log(`📊 Created ${createdCount}/${banners.length} banners`);
  return createdCount;
}

async function seedFeaturedProducts() {
  console.log('⭐ Seeding featured products...');
  
  try {
    // First, get some products to feature
    const productsResponse = await axios.get(`${API_URL}/api/products?pagination[limit]=10`, { headers });
    const products = productsResponse.data.data;
    
    if (!products || products.length === 0) {
      console.log('❌ No products found to feature');
      return 0;
    }

    const featuredTypes = ['featured', 'trending', 'new_arrival', 'best_seller', 'flash_sale'];
    let createdCount = 0;
    
    for (let i = 0; i < Math.min(products.length, 8); i++) {
      const product = products[i];
      const featuredType = featuredTypes[i % featuredTypes.length];
      
      const featuredProduct = {
        product: product.id,
        title: `${featuredType.charAt(0).toUpperCase() + featuredType.slice(1)} Product`,
        subtitle: `Special ${featuredType.replace('_', ' ')} offer`,
        description: `This is a ${featuredType.replace('_', ' ')} product with special features`,
        isActive: true,
        sortOrder: i + 1,
        featuredType: featuredType,
        discountPercentage: Math.floor(Math.random() * 30) + 10,
        highlightColor: ['#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#0ea5e9'][i % 5],
        targetAudience: 'all'
      };

      try {
        const response = await axios.post(`${API_URL}/api/featured-products`, { data: featuredProduct }, { headers });
        console.log(`✅ Created featured product: ${featuredProduct.title}`);
        createdCount++;
      } catch (error) {
        console.log(`❌ Error creating featured product ${featuredProduct.title}:`, error.response?.data?.error?.message || error.message);
      }
    }
    
    console.log(`📊 Created ${createdCount}/${Math.min(products.length, 8)} featured products`);
    return createdCount;
  } catch (error) {
    console.log('❌ Error fetching products:', error.response?.data?.error?.message || error.message);
    return 0;
  }
}

async function main() {
  console.log('🚀 Starting banner and featured product seeding...');
  
  // Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.log('❌ Please start the Strapi server first with: npm run develop');
    return;
  }
  
  try {
    const bannerCount = await seedBanners();
    const featuredCount = await seedFeaturedProducts();
    
    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Summary: ${bannerCount} banners, ${featuredCount} featured products created`);
    
    // Test the created content
    console.log('\n🧪 Testing created content...');
    try {
      const bannersResponse = await axios.get(`${API_URL}/api/banners?filters[isActive][$eq]=true&populate=image`, { headers });
      console.log(`✅ Found ${bannersResponse.data.data?.length || 0} active banners`);
      
      const featuredResponse = await axios.get(`${API_URL}/api/featured-products?filters[isActive][$eq]=true&populate=product,product.image`, { headers });
      console.log(`✅ Found ${featuredResponse.data.data?.length || 0} active featured products`);
    } catch (error) {
      console.log('❌ Error testing content:', error.response?.data?.error?.message || error.message);
    }
    
  } catch (error) {
    console.log('❌ Seeding failed:', error.message);
  }
}

main(); 