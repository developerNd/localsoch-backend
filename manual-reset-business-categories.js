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

async function manualResetBusinessCategories() {
  try {
    console.log('🔄 Starting manual business category reset...');
    
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
    
    // Step 1: Get current business categories
    console.log('\n📋 Step 1: Getting current business categories...');
    const categoriesResponse = await axios.get(`${API_URL}/api/business-categories`, { headers });
    const currentCategories = categoriesResponse.data.data;
    
    console.log('Current business categories:');
    currentCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}`);
    });
    
    // Step 2: Delete all existing business categories
    console.log('\n📋 Step 2: Deleting all existing business categories...');
    for (const category of currentCategories) {
      try {
        await axios.delete(`${API_URL}/api/business-categories/${category.id}`, { headers });
        console.log(`✅ Deleted category: ID ${category.id}, Name: ${category.name}`);
      } catch (error) {
        console.error(`❌ Failed to delete category ${category.id}:`, error.response?.data || error.message);
      }
    }
    
    // Step 3: Wait a moment for deletion to complete
    console.log('\n⏳ Waiting for deletion to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Create new business categories with sequential IDs
    console.log('\n📋 Step 4: Creating new business categories with sequential IDs...');
    
    const newCategories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets', sortOrder: 1 },
      { name: 'Fashion', description: 'Clothing and accessories', sortOrder: 2 },
      { name: 'Home & Garden', description: 'Home improvement and garden products', sortOrder: 3 },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', sortOrder: 4 }
    ];
    
    for (let i = 0; i < newCategories.length; i++) {
      const category = newCategories[i];
      try {
        const createResponse = await axios.post(`${API_URL}/api/business-categories`, {
          data: {
            name: category.name,
            description: category.description,
            isActive: true,
            sortOrder: category.sortOrder
          }
        }, { headers });
        
        const newCategory = createResponse.data.data;
        console.log(`✅ Created new category: ID ${newCategory.id}, Name: ${newCategory.name}`);
      } catch (error) {
        console.error(`❌ Failed to create category ${category.name}:`, error.response?.data || error.message);
      }
    }
    
    // Step 5: Verify the reset
    console.log('\n📋 Step 5: Verifying the reset...');
    const verifyResponse = await axios.get(`${API_URL}/api/business-categories`, { headers });
    const finalCategories = verifyResponse.data.data;
    
    console.log('Final business categories:');
    finalCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, SortOrder: ${cat.sortOrder}`);
    });
    
    console.log('\n✅ Manual business category reset completed!');
    console.log('✅ All business categories now have sequential IDs');
    
  } catch (error) {
    console.error('❌ Error during reset:', error.response?.data || error.message);
  }
}

// Run the manual reset
manualResetBusinessCategories(); 