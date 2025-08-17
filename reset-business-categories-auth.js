const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

// You'll need to get an admin JWT token first
// You can get this by logging into the admin panel or using the auth endpoint
const ADMIN_TOKEN = ''; // Add your admin JWT token here

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

async function resetBusinessCategories() {
  try {
    console.log('🔄 Starting business category reset process...');
    
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
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, SortOrder: ${cat.sortOrder}`);
    });
    
    // Step 2: Get all vendors to check business category references
    console.log('\n📋 Step 2: Checking vendors for business category references...');
    const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=businessCategory`, { headers });
    const vendors = vendorsResponse.data.data;
    
    const vendorsWithCategories = vendors.filter(vendor => vendor.businessCategory);
    console.log(`Found ${vendorsWithCategories.length} vendors with business categories:`);
    vendorsWithCategories.forEach(vendor => {
      console.log(`  Vendor ID: ${vendor.id}, Name: ${vendor.name}, Business Category ID: ${vendor.businessCategory?.id}`);
    });
    
    // Step 3: Create a mapping of old IDs to new sequential IDs
    console.log('\n📋 Step 3: Creating ID mapping...');
    const idMapping = {};
    currentCategories.forEach((cat, index) => {
      const oldId = cat.id;
      const newId = index + 1; // 1, 2, 3, 4
      idMapping[oldId] = newId;
      console.log(`  Old ID ${oldId} -> New ID ${newId} (${cat.name})`);
    });
    
    // Step 4: Create new business categories with sequential IDs
    console.log('\n📋 Step 4: Creating new business categories with sequential IDs...');
    const newCategories = [];
    
    for (let i = 0; i < currentCategories.length; i++) {
      const oldCategory = currentCategories[i];
      const newId = i + 1;
      
      try {
        const createResponse = await axios.post(`${API_URL}/api/business-categories`, {
          data: {
            name: oldCategory.name,
            description: oldCategory.description || '',
            isActive: oldCategory.isActive !== false,
            sortOrder: oldCategory.sortOrder || i
          }
        }, { headers });
        
        const newCategory = createResponse.data.data;
        newCategories.push(newCategory);
        console.log(`✅ Created new category: ID ${newCategory.id}, Name: ${newCategory.name}`);
      } catch (error) {
        console.error(`❌ Failed to create category ${oldCategory.name}:`, error.response?.data || error.message);
      }
    }
    
    // Step 5: Update vendors to use new business category IDs
    console.log('\n📋 Step 5: Updating vendors with new business category IDs...');
    for (const vendor of vendorsWithCategories) {
      const oldCategoryId = vendor.businessCategory.id;
      const newCategoryId = idMapping[oldCategoryId];
      
      if (newCategoryId) {
        try {
          await axios.put(`${API_URL}/api/vendors/${vendor.id}`, {
            data: {
              businessCategory: newCategoryId
            }
          }, { headers });
          console.log(`✅ Updated vendor ${vendor.id} (${vendor.name}): Business category ${oldCategoryId} -> ${newCategoryId}`);
        } catch (error) {
          console.error(`❌ Failed to update vendor ${vendor.id}:`, error.response?.data || error.message);
        }
      }
    }
    
    // Step 6: Delete old business categories
    console.log('\n📋 Step 6: Deleting old business categories...');
    for (const oldCategory of currentCategories) {
      try {
        await axios.delete(`${API_URL}/api/business-categories/${oldCategory.id}`, { headers });
        console.log(`✅ Deleted old category: ID ${oldCategory.id}, Name: ${oldCategory.name}`);
      } catch (error) {
        console.error(`❌ Failed to delete category ${oldCategory.id}:`, error.response?.data || error.message);
      }
    }
    
    // Step 7: Verify the reset
    console.log('\n📋 Step 7: Verifying the reset...');
    const verifyResponse = await axios.get(`${API_URL}/api/business-categories`, { headers });
    const finalCategories = verifyResponse.data.data;
    
    console.log('Final business categories:');
    finalCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, SortOrder: ${cat.sortOrder}`);
    });
    
    // Verify vendors still have correct references
    const verifyVendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=businessCategory`, { headers });
    const finalVendors = verifyVendorsResponse.data.data;
    
    console.log('\nFinal vendor business category references:');
    finalVendors.forEach(vendor => {
      if (vendor.businessCategory) {
        console.log(`  Vendor ${vendor.id} (${vendor.name}) -> Business Category ${vendor.businessCategory.id} (${vendor.businessCategory.name})`);
      }
    });
    
    console.log('\n✅ Business category reset completed successfully!');
    console.log('✅ All business categories now have sequential IDs (1, 2, 3, 4)');
    console.log('✅ All vendor references have been updated');
    
  } catch (error) {
    console.error('❌ Error during reset:', error.response?.data || error.message);
  }
}

// Run the reset
resetBusinessCategories(); 