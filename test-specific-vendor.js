// Test script to test specific vendor API call
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testSpecificVendor() {
  try {
    console.log('🧪 Testing Specific Vendor API Call...\n');

    // Test vendor 2 (which has products)
    console.log('1️⃣ Testing Vendor 2 (has products)...');
    try {
      const vendorResponse = await axios.get(`${API_URL}/api/vendors/2?populate=*`);
      console.log('✅ Vendor 2 API response:');
      console.log(`  ID: ${vendorResponse.data.data.id}`);
      console.log(`  Name: ${vendorResponse.data.data.name}`);
      console.log(`  productsCount: ${vendorResponse.data.data.productsCount}`);
      console.log(`  products array length: ${vendorResponse.data.data.products?.length || 0}`);
      
      if (vendorResponse.data.data.products) {
        console.log('  Products details:');
        vendorResponse.data.data.products.forEach((product, index) => {
          console.log(`    ${index + 1}. ID: ${product.id}, Name: ${product.name}, isActive: ${product.isActive}`);
        });
      }
    } catch (error) {
      console.log('❌ Vendor 2 API failed:', error.response?.data?.error?.message || error.message);
    }

    // Test vendor 22 (which also has products)
    console.log('\n2️⃣ Testing Vendor 22 (has products)...');
    try {
      const vendorResponse = await axios.get(`${API_URL}/api/vendors/22?populate=*`);
      console.log('✅ Vendor 22 API response:');
      console.log(`  ID: ${vendorResponse.data.data.id}`);
      console.log(`  Name: ${vendorResponse.data.data.name}`);
      console.log(`  productsCount: ${vendorResponse.data.data.productsCount}`);
      console.log(`  products array length: ${vendorResponse.data.data.products?.length || 0}`);
      
      if (vendorResponse.data.data.products) {
        console.log('  Products details:');
        vendorResponse.data.data.products.forEach((product, index) => {
          console.log(`    ${index + 1}. ID: ${product.id}, Name: ${product.name}, isActive: ${product.isActive}`);
        });
      }
    } catch (error) {
      console.log('❌ Vendor 22 API failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Specific Vendor Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSpecificVendor(); 