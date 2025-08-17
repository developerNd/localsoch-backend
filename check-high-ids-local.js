const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function checkHighIds() {
  try {
    console.log('🔍 Checking for business categories with high IDs...');
    
    // Get all business categories
    const response = await axios.get(`${API_URL}/api/business-categories`);
    const categories = response.data.data;
    
    console.log('📋 All business categories:');
    categories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, Created: ${cat.createdAt}`);
    });
    
    // Check for high IDs
    const highIdCategories = categories.filter(cat => cat.id > 1000);
    if (highIdCategories.length > 0) {
      console.log('\n⚠️  Found business categories with high IDs:');
      highIdCategories.forEach(cat => {
        console.log(`  ID: ${cat.id}, Name: ${cat.name}`);
      });
    } else {
      console.log('\n✅ No business categories with high IDs found.');
    }
    
    // Check the database directly for any gaps or issues
    console.log('\n🔍 Checking for any database issues...');
    
    // Try to get business categories with pagination to see if there are more
    const paginatedResponse = await axios.get(`${API_URL}/api/business-categories?pagination[pageSize]=100`);
    const paginatedCategories = paginatedResponse.data.data;
    
    console.log(`📊 Total business categories found: ${paginatedCategories.length}`);
    console.log(`📊 Pagination meta:`, paginatedResponse.data.meta);
    
    if (paginatedCategories.length > categories.length) {
      console.log('⚠️  Found more categories with pagination!');
      paginatedCategories.forEach(cat => {
        console.log(`  ID: ${cat.id}, Name: ${cat.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkHighIds(); 