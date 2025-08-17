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

async function verifyBusinessCategories() {
  try {
    console.log('🔍 Verifying business categories...');
    
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
    
    // Check with admin authentication
    console.log('\n📋 Checking with admin authentication...');
    const adminResponse = await axios.get(`${API_URL}/api/business-categories?populate=*`, { headers });
    const adminCategories = adminResponse.data.data;
    
    console.log('Business categories (admin API):');
    adminCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, Created: ${cat.createdAt}`);
    });
    
    // Check without authentication
    console.log('\n📋 Checking without authentication...');
    const publicResponse = await axios.get(`${API_URL}/api/business-categories`);
    const publicCategories = publicResponse.data.data;
    
    console.log('Business categories (public API):');
    publicCategories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}`);
    });
    
    // Check for any soft-deleted records
    console.log('\n📋 Checking for soft-deleted records...');
    try {
      const deletedResponse = await axios.get(`${API_URL}/api/business-categories?filters[deletedAt][$notNull]=true`, { headers });
      const deletedCategories = deletedResponse.data.data;
      
      if (deletedCategories.length > 0) {
        console.log('Soft-deleted business categories:');
        deletedCategories.forEach(cat => {
          console.log(`  ID: ${cat.id}, Name: ${cat.name}, Deleted: ${cat.deletedAt}`);
        });
      } else {
        console.log('No soft-deleted business categories found');
      }
    } catch (error) {
      console.log('Could not check for soft-deleted records:', error.response?.status);
    }
    
    // Check specific IDs that dashboard might be showing
    console.log('\n📋 Checking specific IDs (17, 19, 21, 23)...');
    const specificIds = [17, 19, 21, 23];
    
    for (const id of specificIds) {
      try {
        const response = await axios.get(`${API_URL}/api/business-categories/${id}`, { headers });
        console.log(`✅ Found business category ID ${id}: ${response.data.data.name}`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ Business category ID ${id} not found`);
        } else {
          console.log(`⚠️  Error checking ID ${id}: ${error.response?.status}`);
        }
      }
    }
    
    console.log('\n💡 Dashboard vs API Discrepancy:');
    console.log('  - API shows: IDs 18, 20, 22, 24');
    console.log('  - Dashboard shows: IDs 17, 19, 21, 23');
    console.log('  - This suggests dashboard caching or different data');
    
    console.log('\n🔧 Solutions:');
    console.log('  1. Refresh the Strapi dashboard (Ctrl+F5 or Cmd+Shift+R)');
    console.log('  2. Clear browser cache');
    console.log('  3. Restart Strapi server');
    console.log('  4. Check if you\'re looking at the correct Strapi instance');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.response?.data || error.message);
  }
}

// Run the verification
verifyBusinessCategories(); 