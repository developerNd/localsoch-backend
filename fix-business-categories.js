const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function fixBusinessCategories() {
  try {
    console.log('🔧 Fixing business categories...');
    
    // First, let's get all business categories
    console.log('\n📋 Getting all business categories...');
    const response = await axios.get(`${API_URL}/api/business-categories`);
    
    if (!response.data.data || response.data.data.length === 0) {
      console.log('No business categories found');
      return;
    }
    
    console.log('Found business categories:', response.data.data.length);
    
    // Update each business category with default sortOrder if missing
    for (let i = 0; i < response.data.data.length; i++) {
      const category = response.data.data[i];
      const categoryId = category.id;
      
      console.log(`\n📝 Processing category ${i + 1}/${response.data.data.length}: ${category.name || categoryId}`);
      
      // Check if sortOrder is missing or null
      if (category.sortOrder === null || category.sortOrder === undefined) {
        console.log(`🔧 Adding sortOrder ${i + 1} to category ${categoryId}`);
        
        try {
          const updateResponse = await axios.put(`${API_URL}/api/business-categories/${categoryId}`, {
            data: {
              sortOrder: i + 1
            }
          });
          
          console.log(`✅ Updated category ${categoryId} with sortOrder ${i + 1}`);
        } catch (updateError) {
          console.error(`❌ Failed to update category ${categoryId}:`, updateError.response?.data || updateError.message);
        }
      } else {
        console.log(`✅ Category ${categoryId} already has sortOrder: ${category.sortOrder}`);
      }
    }
    
    console.log('\n🎉 Business categories fix completed!');
    
    // Test the API again
    console.log('\n🧪 Testing business categories API...');
    const testResponse = await axios.get(`${API_URL}/api/business-categories`);
    console.log('✅ Business categories API working:', testResponse.data.data.length, 'categories found');
    
  } catch (error) {
    console.error('❌ Error fixing business categories:', error.message);
  }
}

fixBusinessCategories(); 