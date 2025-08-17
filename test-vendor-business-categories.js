const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testVendorBusinessCategories() {
  try {
    console.log('🔍 Testing vendor business categories...');
    
    // Get all vendors with business categories
    const response = await axios.get(`${API_URL}/api/vendors?populate=*`);
    
    console.log('🔍 Total vendors found:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach((vendor, index) => {
        console.log(`\n🔍 Vendor ${index + 1}:`);
        console.log('  ID:', vendor.id);
        console.log('  Name:', vendor.attributes?.name);
        console.log('  Business Category:', vendor.attributes?.businessCategory?.data?.attributes?.name || 'None');
        console.log('  Raw business category data:', vendor.attributes?.businessCategory);
      });
    } else {
      console.log('No vendors found');
    }
    
  } catch (error) {
    console.error('Error testing vendor business categories:', error.response?.data || error.message);
  }
}

testVendorBusinessCategories(); 