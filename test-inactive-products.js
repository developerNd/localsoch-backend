// Test script to check for inactive products
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testInactiveProducts() {
  try {
    console.log('🧪 Testing for Inactive Products...\n');

    // Test 1: Get all products
    console.log('1️⃣ Getting All Products...');
    try {
      const productsResponse = await axios.get(`${API_URL}/api/products?populate=*`);
      console.log('✅ Products endpoint working');
      console.log('📊 Total products:', productsResponse.data.data?.length || 0);
      
      if (productsResponse.data.data && productsResponse.data.data.length > 0) {
        const activeProducts = productsResponse.data.data.filter(p => p.isActive === true);
        const inactiveProducts = productsResponse.data.data.filter(p => p.isActive === false);
        const undefinedActiveProducts = productsResponse.data.data.filter(p => p.isActive === undefined);
        
        console.log('\n📊 Product Status Summary:');
        console.log(`  Active products: ${activeProducts.length}`);
        console.log(`  Inactive products: ${inactiveProducts.length}`);
        console.log(`  Undefined isActive: ${undefinedActiveProducts.length}`);
        
        if (inactiveProducts.length > 0) {
          console.log('\n📝 Inactive Products:');
          inactiveProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ID: ${product.id}, Name: ${product.name}, Vendor: ${product.vendor?.name || product.vendorId}, isActive: ${product.isActive}`);
          });
        }
        
        if (undefinedActiveProducts.length > 0) {
          console.log('\n📝 Products with undefined isActive:');
          undefinedActiveProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ID: ${product.id}, Name: ${product.name}, Vendor: ${product.vendor?.name || product.vendorId}, isActive: ${product.isActive}`);
          });
        }
        
        // Group by vendor
        console.log('\n📝 Products by Vendor:');
        const vendorGroups = {};
        productsResponse.data.data.forEach(product => {
          const vendorId = product.vendor?.id || product.vendorId;
          const vendorName = product.vendor?.name || `Vendor ${vendorId}`;
          const key = `${vendorId} - ${vendorName}`;
          
          if (!vendorGroups[key]) {
            vendorGroups[key] = { active: 0, inactive: 0, undefined: 0 };
          }
          
          if (product.isActive === true) {
            vendorGroups[key].active++;
          } else if (product.isActive === false) {
            vendorGroups[key].inactive++;
          } else {
            vendorGroups[key].undefined++;
          }
        });
        
        Object.entries(vendorGroups).forEach(([vendorKey, counts]) => {
          console.log(`  ${vendorKey}:`);
          console.log(`    Active: ${counts.active}, Inactive: ${counts.inactive}, Undefined: ${counts.undefined}`);
        });
      }
    } catch (error) {
      console.log('❌ Products endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Inactive Products Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testInactiveProducts(); 