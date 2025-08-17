const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function updateExistingCategories() {
  try {
    console.log('🔍 Updating existing categories with default values...');
    
    // First, get all categories
    const getResponse = await axios.get(`${API_URL}/api/categories`);
    const categories = getResponse.data.data;
    
    console.log(`📊 Found ${categories.length} categories to update`);
    
    for (const category of categories) {
      console.log(`\n📝 Updating category: ${category.name} (ID: ${category.id})`);
      
      // Update with default values if they're null
      const updateData = {
        isActive: category.isActive === null ? true : category.isActive,
        sortOrder: category.sortOrder === null ? 0 : category.sortOrder
      };
      
      console.log('📊 Update data:', updateData);
      
      const updateResponse = await axios.put(`${API_URL}/api/categories/${category.id}`, {
        data: updateData
      });
      
      if (updateResponse.status === 200) {
        console.log(`✅ Successfully updated category: ${category.name}`);
      } else {
        console.log(`⚠️  Unexpected status: ${updateResponse.status} for ${category.name}`);
      }
    }
    
    console.log('\n🎉 All categories updated successfully!');
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const verifyResponse = await axios.get(`${API_URL}/api/categories`);
    console.log('📊 Updated categories:', JSON.stringify(verifyResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error updating categories:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateExistingCategories(); 