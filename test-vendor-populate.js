const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testVendorPopulate() {
  try {
    console.log('🔍 Testing vendor populate with business categories...');
    
    // Test 1: Get vendors with populate=*
    console.log('\n🔍 Test 1: GET /api/vendors?populate=*');
    const response1 = await axios.get(`${API_URL}/api/vendors?populate=*`);
    
    console.log('Response status:', response1.status);
    console.log('Total vendors:', response1.data.data?.length || 0);
    
    if (response1.data.data && response1.data.data.length > 0) {
      const vendor = response1.data.data[0];
      console.log('First vendor business category:', vendor.attributes?.businessCategory);
      console.log('First vendor business category name:', vendor.attributes?.businessCategory?.data?.attributes?.name);
    }
    
    // Test 2: Get specific vendor with populate=businessCategory
    console.log('\n🔍 Test 2: GET /api/vendors/2?populate=businessCategory');
    const response2 = await axios.get(`${API_URL}/api/vendors/2?populate=businessCategory`);
    
    console.log('Response status:', response2.status);
    console.log('Vendor business category:', response2.data.data?.attributes?.businessCategory);
    console.log('Vendor business category name:', response2.data.data?.attributes?.businessCategory?.data?.attributes?.name);
    
    // Test 3: Get vendors with explicit populate
    console.log('\n🔍 Test 3: GET /api/vendors?populate=businessCategory');
    const response3 = await axios.get(`${API_URL}/api/vendors?populate=businessCategory`);
    
    console.log('Response status:', response3.status);
    console.log('Total vendors:', response3.data.data?.length || 0);
    
    if (response3.data.data && response3.data.data.length > 0) {
      response3.data.data.forEach((vendor, index) => {
        console.log(`Vendor ${index + 1} (ID: ${vendor.id}):`, {
          name: vendor.attributes?.name,
          businessCategory: vendor.attributes?.businessCategory?.data?.attributes?.name || 'None'
        });
      });
    }
    
  } catch (error) {
    console.error('Error testing vendor populate:', error.response?.data || error.message);
  }
}

testVendorPopulate(); 