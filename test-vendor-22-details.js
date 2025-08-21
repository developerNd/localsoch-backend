// Test script to check Vendor 22's products in detail
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testVendor22Details() {
  try {
    console.log('🧪 Testing Vendor 22 Products in Detail...\n');

    // Test 1: Get Vendor 22 details
    console.log('1️⃣ Getting Vendor 22 Details...');
    try {
      const vendorResponse = await axios.get(`${API_URL}/api/vendors/22?populate=*`);
      console.log('✅ Vendor 22 API response:');
      console.log(`  ID: ${vendorResponse.data.data.id}`);
      console.log(`  Name: ${vendorResponse.data.data.name}`);
      console.log(`  productsCount: ${vendorResponse.data.data.productsCount}`);
      console.log(`  products array length: ${vendorResponse.data.data.products?.length || 0}`);
    } catch (error) {
      console.log('❌ Vendor 22 API failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 2: Get all products for Vendor 22 with full details
    console.log('\n2️⃣ Getting All Products for Vendor 22...');
    try {
      const productsResponse = await axios.get(`${API_URL}/api/products?filters[vendor][$eq]=22&populate=*`);
      console.log('✅ Products for Vendor 22:');
      console.log(`  Total products: ${productsResponse.data.data?.length || 0}`);
      
      if (productsResponse.data.data && productsResponse.data.data.length > 0) {
        console.log('\n📝 Product Details:');
        productsResponse.data.data.forEach((product, index) => {
          console.log(`\n  Product ${index + 1}:`);
          console.log(`    ID: ${product.id}`);
          console.log(`    Name: ${product.name}`);
          console.log(`    isActive: ${product.isActive}`);
          console.log(`    status: ${product.status}`);
          console.log(`    publishedAt: ${product.publishedAt}`);
          console.log(`    createdAt: ${product.createdAt}`);
          console.log(`    updatedAt: ${product.updatedAt}`);
          
          // Show all available fields
          console.log(`    All fields:`, JSON.stringify(product, null, 2));
        });
        
        // Count by different criteria
        const activeCount = productsResponse.data.data.filter(p => p.isActive === true).length;
        const inactiveCount = productsResponse.data.data.filter(p => p.isActive === false).length;
        const undefinedActiveCount = productsResponse.data.data.filter(p => p.isActive === undefined).length;
        const nullActiveCount = productsResponse.data.data.filter(p => p.isActive === null).length;
        
        console.log('\n📊 Product Counts:');
        console.log(`  isActive: true: ${activeCount}`);
        console.log(`  isActive: false: ${inactiveCount}`);
        console.log(`  isActive: undefined: ${undefinedActiveCount}`);
        console.log(`  isActive: null: ${nullActiveCount}`);
        console.log(`  Total: ${productsResponse.data.data.length}`);
      }
    } catch (error) {
      console.log('❌ Products for Vendor 22 failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 3: Check if there are any products with different status values
    console.log('\n3️⃣ Checking for Products with Different Status Values...');
    try {
      const allProductsResponse = await axios.get(`${API_URL}/api/products?populate=*`);
      console.log('✅ All Products Status Check:');
      
      if (allProductsResponse.data.data && allProductsResponse.data.data.length > 0) {
        const statusGroups = {};
        const isActiveGroups = {};
        
        allProductsResponse.data.data.forEach(product => {
          // Group by status
          const status = product.status || 'undefined';
          if (!statusGroups[status]) statusGroups[status] = [];
          statusGroups[status].push(product);
          
          // Group by isActive
          const isActive = product.isActive;
          const isActiveKey = isActive === true ? 'true' : isActive === false ? 'false' : 'undefined';
          if (!isActiveGroups[isActiveKey]) isActiveGroups[isActiveKey] = [];
          isActiveGroups[isActiveKey].push(product);
        });
        
        console.log('\n📊 Status Groups:');
        Object.entries(statusGroups).forEach(([status, products]) => {
          console.log(`  status: "${status}" - ${products.length} products`);
          products.forEach(product => {
            console.log(`    - ID: ${product.id}, Name: ${product.name}, Vendor: ${product.vendor?.name || product.vendorId}`);
          });
        });
        
        console.log('\n📊 isActive Groups:');
        Object.entries(isActiveGroups).forEach(([isActive, products]) => {
          console.log(`  isActive: ${isActive} - ${products.length} products`);
          products.forEach(product => {
            console.log(`    - ID: ${product.id}, Name: ${product.name}, Vendor: ${product.vendor?.name || product.vendorId}`);
          });
        });
      }
    } catch (error) {
      console.log('❌ All products status check failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Vendor 22 Details Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testVendor22Details(); 