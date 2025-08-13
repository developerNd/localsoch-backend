const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function checkContentTypes() {
  try {
    console.log('📋 Checking content type structures...');
    
    // Login to get JWT
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Get content types
    const contentTypesResponse = await axios.get(`${API_URL}/api/content-type-builder/content-types`, { headers });
    console.log('✅ Content types accessible');
    console.log('Available content types:', contentTypesResponse.data.data?.length || 0);
    
    // Check specific content types
    const contentTypes = ['category', 'product', 'vendor', 'banner', 'featured-product', 'order'];
    
    for (const contentType of contentTypes) {
      try {
        const response = await axios.get(`${API_URL}/api/content-type-builder/content-types/api::${contentType}.${contentType}`, { headers });
        console.log(`\n📝 ${contentType.toUpperCase()} structure:`);
        console.log('Fields:', Object.keys(response.data.data.schema.attributes || {}));
        
        // Show field details
        const attributes = response.data.data.schema.attributes || {};
        for (const [fieldName, fieldConfig] of Object.entries(attributes)) {
          console.log(`  - ${fieldName}: ${fieldConfig.type}${fieldConfig.required ? ' (required)' : ''}`);
        }
        
      } catch (error) {
        console.log(`❌ Could not get ${contentType} structure:`, error.response?.status);
      }
    }
    
    // Try to create a category without slug
    console.log('\n🧪 Testing category creation without slug...');
    try {
      const createResponse = await axios.post(`${API_URL}/api/categories`, {
        data: {
          name: 'Test Category',
          description: 'Test description'
        }
      }, { headers });
      
      console.log('✅ Category creation successful:', createResponse.data);
    } catch (error) {
      console.log('❌ Category creation failed:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Error checking content types:', error.response?.data || error.message);
  }
}

checkContentTypes(); 