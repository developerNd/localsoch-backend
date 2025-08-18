const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:1337';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ ADMIN_TOKEN environment variable is required');
  console.log('💡 Set it with: export ADMIN_TOKEN=your_admin_token_here');
  process.exit(1);
}

async function testBusinessCategoriesAPI() {
  console.log('🔍 Testing Business Categories API...\n');
  
  try {
    // Test 1: Get all business categories
    console.log('📋 Test 1: Fetching all business categories...');
    const getAllResponse = await axios.get(
      `${API_URL}/api/business-categories?populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );
    
    if (getAllResponse.status === 200) {
      const categories = getAllResponse.data.data;
      console.log(`✅ Success! Found ${categories.length} business categories`);
      
      if (categories.length > 0) {
        console.log('\n📊 Categories found:');
        categories.forEach((cat, index) => {
          console.log(`  ${index + 1}. ID: ${cat.id} - ${cat.attributes.name} (${cat.attributes.isActive ? 'Active' : 'Inactive'})`);
          if (cat.attributes.image) {
            console.log(`     📷 Has image: ${cat.attributes.image.data?.attributes?.url || 'Image data present'}`);
          }
        });
        
        // Test 2: Get specific category (first one)
        const firstCategory = categories[0];
        console.log(`\n📋 Test 2: Fetching specific category (ID: ${firstCategory.id})...`);
        
        const getSpecificResponse = await axios.get(
          `${API_URL}/api/business-categories/${firstCategory.id}?populate=*`,
          {
            headers: {
              'Authorization': `Bearer ${ADMIN_TOKEN}`
            }
          }
        );
        
        if (getSpecificResponse.status === 200) {
          console.log(`✅ Success! Retrieved category: ${getSpecificResponse.data.data.attributes.name}`);
        } else {
          console.log(`⚠️  Unexpected status: ${getSpecificResponse.status}`);
        }
        
        // Test 3: Try to get category with ID 18 (the one that's failing)
        console.log('\n📋 Test 3: Testing category ID 18 (the failing one)...');
        try {
          const testId18Response = await axios.get(
            `${API_URL}/api/business-categories/18?populate=*`,
            {
              headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
              }
            }
          );
          
          if (testId18Response.status === 200) {
            console.log('✅ Success! Category ID 18 exists');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log('❌ Category ID 18 does not exist (404 Not Found)');
            console.log('💡 This explains the frontend error. The category might have been deleted or never existed.');
          } else {
            console.log(`⚠️  Error testing ID 18: ${error.message}`);
          }
        }
        
      } else {
        console.log('⚠️  No business categories found. You may need to seed the data.');
      }
    } else {
      console.log(`⚠️  Unexpected status: ${getAllResponse.status}`);
    }
    
    // Test 4: Check if we can create a new category
    console.log('\n📋 Test 4: Testing category creation...');
    const testCategory = {
      name: 'Test Category for API',
      description: 'This is a test category to verify the API is working',
      isActive: true,
      sortOrder: 999
    };
    
    const createResponse = await axios.post(
      `${API_URL}/api/business-categories`,
      { data: testCategory },
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (createResponse.status === 200) {
      const createdCategory = createResponse.data.data;
      console.log(`✅ Success! Created test category: ${createdCategory.attributes.name} (ID: ${createdCategory.id})`);
      
      // Clean up: Delete the test category
      console.log('\n🧹 Cleaning up: Deleting test category...');
      await axios.delete(
        `${API_URL}/api/business-categories/${createdCategory.id}`,
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`
          }
        }
      );
      console.log('✅ Test category deleted');
    } else {
      console.log(`⚠️  Creation failed with status: ${createResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing business categories API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testBusinessCategoriesAPI(); 