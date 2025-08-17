const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function fixVendorData() {
  try {
    console.log('🔍 Fixing vendor data...');
    
    // Get admin token first
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.jwt;
    console.log('🔍 Admin token obtained');
    
    // Get vendors with business categories from database
    const vendorsWithCategories = [
      { id: 2, name: 'shop', businessCategoryId: 24 },
      { id: 16, name: 'testq', businessCategoryId: 20 },
      { id: 17, name: 'Test Shop with Category', businessCategoryId: 18 }
    ];
    
    for (const vendor of vendorsWithCategories) {
      console.log(`🔍 Updating vendor ${vendor.id}: ${vendor.name}`);
      
      try {
        const updateResponse = await axios.put(`${API_URL}/api/vendors/${vendor.id}`, {
          data: {
            name: vendor.name,
            businessCategory: vendor.businessCategoryId
          }
        }, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Vendor ${vendor.id} updated successfully`);
        
        // Verify the update
        const verifyResponse = await axios.get(`${API_URL}/api/vendors/${vendor.id}?populate=businessCategory`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const vendorData = verifyResponse.data.data;
        console.log(`🔍 Verification - Vendor ${vendor.id}:`, {
          name: vendorData.attributes?.name,
          businessCategory: vendorData.attributes?.businessCategory?.data?.attributes?.name
        });
        
      } catch (error) {
        console.error(`❌ Error updating vendor ${vendor.id}:`, error.response?.data || error.message);
      }
    }
    
    console.log('🔍 Vendor data fix completed');
    
  } catch (error) {
    console.error('Error fixing vendor data:', error.response?.data || error.message);
  }
}

fixVendorData(); 