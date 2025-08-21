// Test script to check product statuses for a vendor
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testProductStatuses() {
  try {
    console.log('🧪 Testing Product Statuses for Vendor...\n');

    // Test 1: Get all products for vendor 2
    console.log('1️⃣ Getting All Products for Vendor 2...');
    try {
      const productsResponse = await axios.get(`${API_URL}/api/products?filters[vendor][$eq]=2&populate=*`);
      console.log('✅ Products endpoint working');
      console.log('📊 Total products for vendor 2:', productsResponse.data.data?.length || 0);
      
      if (productsResponse.data.data && productsResponse.data.data.length > 0) {
        console.log('📝 Product details:');
        productsResponse.data.data.forEach((product, index) => {
          console.log(`  ${index + 1}. ID: ${product.id}, Name: ${product.name}, Status: ${product.status}, isActive: ${product.isActive}`);
        });
        
        // Count by status
        const statusCounts = {};
        const activeCount = productsResponse.data.data.filter(p => p.isActive === true).length;
        const approvedCount = productsResponse.data.data.filter(p => p.status === 'approved').length;
        const pendingCount = productsResponse.data.data.filter(p => p.status === 'pending').length;
        const rejectedCount = productsResponse.data.data.filter(p => p.status === 'rejected').length;
        
        console.log('\n📊 Product Counts:');
        console.log(`  Active (isActive: true): ${activeCount}`);
        console.log(`  Approved (status: approved): ${approvedCount}`);
        console.log(`  Pending (status: pending): ${pendingCount}`);
        console.log(`  Rejected (status: rejected): ${rejectedCount}`);
        console.log(`  Total: ${productsResponse.data.data.length}`);
      }
    } catch (error) {
      console.log('❌ Products endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 2: Test the count API directly
    console.log('\n2️⃣ Testing Count API for Active Products...');
    try {
      const activeCountResponse = await axios.get(`${API_URL}/api/products?filters[vendor][$eq]=2&filters[isActive][$eq]=true&pagination[limit]=1`);
      console.log('✅ Active products count:', activeCountResponse.data.meta?.pagination?.total || 0);
    } catch (error) {
      console.log('❌ Active products count failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 3: Test the count API for Approved Products
    console.log('\n3️⃣ Testing Count API for Approved Products...');
    try {
      const approvedCountResponse = await axios.get(`${API_URL}/api/products?filters[vendor][$eq]=2&filters[status][$eq]=approved&pagination[limit]=1`);
      console.log('✅ Approved products count:', approvedCountResponse.data.meta?.pagination?.total || 0);
    } catch (error) {
      console.log('❌ Approved products count failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Product Status Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductStatuses(); 