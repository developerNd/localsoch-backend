const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:1337';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ ADMIN_TOKEN environment variable is required');
  process.exit(1);
}

const businessCategories = [
  {
    name: 'Electronics & Gadgets',
    description: 'Mobile phones, laptops, accessories, and electronic devices',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Fashion & Apparel',
    description: 'Clothing, shoes, bags, and fashion accessories',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Food & Beverage',
    description: 'Restaurants, cafes, food delivery, and beverages',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Home & Garden',
    description: 'Furniture, home decor, gardening supplies',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Health & Beauty',
    description: 'Cosmetics, skincare, health products, and wellness',
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Sports & Fitness',
    description: 'Sports equipment, fitness gear, and athletic wear',
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Books & Education',
    description: 'Books, educational materials, and learning resources',
    isActive: true,
    sortOrder: 7
  },
  {
    name: 'Automotive',
    description: 'Car parts, accessories, and automotive services',
    isActive: true,
    sortOrder: 8
  },
  {
    name: 'Jewelry & Watches',
    description: 'Precious metals, gemstones, and timepieces',
    isActive: true,
    sortOrder: 9
  },
  {
    name: 'Toys & Games',
    description: 'Children toys, board games, and entertainment',
    isActive: true,
    sortOrder: 10
  },
  {
    name: 'Pet Supplies',
    description: 'Pet food, accessories, and veterinary products',
    isActive: true,
    sortOrder: 11
  },
  {
    name: 'Art & Crafts',
    description: 'Art supplies, handmade items, and creative materials',
    isActive: true,
    sortOrder: 12
  },
  {
    name: 'Music & Instruments',
    description: 'Musical instruments, audio equipment, and music accessories',
    isActive: true,
    sortOrder: 13
  },
  {
    name: 'Travel & Tourism',
    description: 'Travel services, tour packages, and tourism products',
    isActive: true,
    sortOrder: 14
  },
  {
    name: 'Other',
    description: 'Miscellaneous business categories',
    isActive: true,
    sortOrder: 15
  }
];

async function seedBusinessCategories() {
  console.log('🌱 Starting business categories seeding...');
  
  try {
    for (const category of businessCategories) {
      console.log(`📝 Creating business category: ${category.name}`);
      
      const response = await axios.post(
        `${API_URL}/api/business-categories`,
        { data: category },
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        console.log(`✅ Created: ${category.name}`);
      } else {
        console.log(`⚠️  Unexpected status: ${response.status} for ${category.name}`);
      }
    }
    
    console.log('🎉 Business categories seeding completed!');
    
    // Fetch and display all created categories
    const fetchResponse = await axios.get(
      `${API_URL}/api/business-categories?populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );
    
    if (fetchResponse.status === 200) {
      const categories = fetchResponse.data.data;
      console.log(`\n📊 Total business categories created: ${categories.length}`);
      console.log('\n📋 Created categories:');
      categories.forEach(cat => {
        console.log(`  - ${cat.attributes.name} (${cat.attributes.isActive ? 'Active' : 'Inactive'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error seeding business categories:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the seeding
seedBusinessCategories(); 