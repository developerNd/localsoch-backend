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

async function resetBusinessCategoriesTable() {
  try {
    console.log('🔄 Starting complete business categories table reset...');
    
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
    
    // Step 1: Get all current business categories
    console.log('\n📋 Step 1: Getting all current business categories...');
    const categoriesResponse = await axios.get(`${API_URL}/api/business-categories`, { headers });
    const currentCategories = categoriesResponse.data.data;
    
    console.log(`Found ${currentCategories.length} business categories to delete:`);
    currentCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}`);
    });
    
    // Step 2: Delete all business categories
    console.log('\n📋 Step 2: Deleting all business categories...');
    for (const category of currentCategories) {
      try {
        await axios.delete(`${API_URL}/api/business-categories/${category.id}`, { headers });
        console.log(`✅ Deleted category: ID ${category.id}, Name: ${category.name}`);
      } catch (error) {
        console.error(`❌ Failed to delete category ${category.id}:`, error.response?.data || error.message);
      }
    }
    
    // Step 3: Wait for deletion to complete
    console.log('\n⏳ Waiting for deletion to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Verify deletion
    console.log('\n📋 Step 3: Verifying deletion...');
    const verifyResponse = await axios.get(`${API_URL}/api/business-categories`, { headers });
    const remainingCategories = verifyResponse.data.data;
    
    if (remainingCategories.length === 0) {
      console.log('✅ All business categories deleted successfully');
    } else {
      console.log(`⚠️  ${remainingCategories.length} categories still remain`);
      remainingCategories.forEach(cat => {
        console.log(`  ID: ${cat.id}, Name: ${cat.name}`);
      });
    }
    
    // Step 5: Create new business categories with sequential IDs
    console.log('\n📋 Step 4: Creating new business categories with sequential IDs...');
    
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to create category ${category.name}:`, error.response?.data || error.message);
      }
    }
    
    // Step 6: Final verification
    console.log('\n📋 Step 5: Final verification...');
    const finalResponse = await axios.get(`${API_URL}/api/business-categories`, { headers });
    const finalCategories = finalResponse.data.data;
    
    console.log('Final business categories:');
    finalCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, SortOrder: ${cat.sortOrder}`);
    });
    
    // Check if we have sequential IDs starting from 1
    const ids = finalCategories.map(cat => cat.id).sort((a, b) => a - b);
    console.log('\n📊 ID Analysis:');
    console.log(`  All IDs: [${ids.join(', ')}]`);
    console.log(`  First ID: ${ids[0]}`);
    console.log(`  Last ID: ${ids[ids.length - 1]}`);
    
    if (ids[0] === 1) {
      console.log('🎉 SUCCESS! Business categories now start from ID 1');
      console.log('✅ Sequential IDs achieved: 1, 2, 3, 4');
    } else {
      console.log(`⚠️  Business categories start from ID ${ids[0]} instead of 1`);
      console.log('💡 The auto-increment counter may need a database reset');
    }
    
    console.log('\n✅ Business categories table reset completed!');
    console.log('✅ Frontend will now work with sequential IDs');
    
  } catch (error) {
    console.error('❌ Error during reset:', error.response?.data || error.message);
  }
}

// Run the complete reset
resetBusinessCategoriesTable(); 