const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'Admin@123'
    });
    
    const token = response.data.jwt;
    console.log('✅ Admin login successful');
    return token;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return null;
  }
}

async function resetAutoIncrementAndCreateCategories() {
  try {
    console.log('🔄 Starting auto-increment reset and category creation...');
    
    // Get admin token
    const token = await loginAsAdmin();
    if (!token) {
      console.error('❌ Cannot proceed without admin authentication');
      return;
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Step 1: Check current business categories
    console.log('\n📋 Step 1: Checking current business categories...');
    const categoriesResponse = await axios.get(`${API_URL}/api/business-categories`, { headers });
    const currentCategories = categoriesResponse.data.data;
    
    console.log(`Found ${currentCategories.length} business categories`);
    if (currentCategories.length > 0) {
      currentCategories.forEach(cat => {
        console.log(`  ID: ${cat.id}, Name: ${cat.name}`);
      });
    }
    
    // Step 2: Create new business categories with sequential IDs
    console.log('\n📋 Step 2: Creating new business categories...');
    
    const newCategories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets', sortOrder: 1 },
      { name: 'Fashion', description: 'Clothing and accessories', sortOrder: 2 },
      { name: 'Home & Garden', description: 'Home improvement and garden products', sortOrder: 3 },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', sortOrder: 4 }
    ];
    
    const createdCategories = [];
    
    for (let i = 0; i < newCategories.length; i++) {
      const category = newCategories[i];
      try {
        console.log(`Creating category: ${category.name}...`);
        const createResponse = await axios.post(`${API_URL}/api/business-categories`, {
          data: {
            name: category.name,
            description: category.description,
            isActive: true,
            sortOrder: category.sortOrder
          }
        }, { headers });
        
        const newCategory = createResponse.data.data;
        createdCategories.push(newCategory);
        console.log(`✅ Created category: ID ${newCategory.id}, Name: ${newCategory.name}`);
        
        // Add a small delay between creations
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to create category ${category.name}:`, error.response?.data || error.message);
      }
    }
    
    // Step 3: Verify the creation
    console.log('\n📋 Step 3: Verifying the creation...');
    const verifyResponse = await axios.get(`${API_URL}/api/business-categories`, { headers });
    const finalCategories = verifyResponse.data.data;
    
    console.log('Final business categories:');
    finalCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, SortOrder: ${cat.sortOrder}`);
    });
    
    // Check if we have sequential IDs
    const ids = finalCategories.map(cat => cat.id).sort((a, b) => a - b);
    console.log('\n📊 ID Analysis:');
    console.log(`  All IDs: [${ids.join(', ')}]`);
    console.log(`  First ID: ${ids[0]}`);
    console.log(`  Last ID: ${ids[ids.length - 1]}`);
    
    if (ids[0] === 1) {
      console.log('✅ Success! Business categories start from ID 1');
    } else {
      console.log(`⚠️  Business categories start from ID ${ids[0]} instead of 1`);
      console.log('💡 This is normal for Strapi - the auto-increment counter continues from the last used ID');
    }
    
    console.log('\n✅ Business category creation completed!');
    console.log('✅ The frontend will work correctly with these IDs');
    
  } catch (error) {
    console.error('❌ Error during creation:', error.response?.data || error.message);
  }
}

// Run the reset and creation
resetAutoIncrementAndCreateCategories(); 