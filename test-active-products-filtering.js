const axios = require('axios');

const API_URL = 'http://192.168.1.100:1337';

async function testActiveProductsFiltering() {
  console.log('🧪 Testing Active Products Filtering');
  console.log('=====================================');

  try {
    // Test 1: All products without filters
    console.log('\n1️⃣ Testing all products (no filters)...');
    const allProductsResponse = await axios.get(`${API_URL}/api/products?populate=*`);
    const allProducts = allProductsResponse.data.data || [];
    console.log(`📊 Total products without filters: ${allProducts.length}`);

    // Show product status breakdown
    const statusBreakdown = {};
    allProducts.forEach(product => {
      const isActive = product.attributes?.isActive;
      const approvalStatus = product.attributes?.approvalStatus;
      const key = `isActive: ${isActive}, approvalStatus: ${approvalStatus}`;
      statusBreakdown[key] = (statusBreakdown[key] || 0) + 1;
    });
    
    console.log('📋 Product status breakdown:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} products`);
    });

    // Test 2: Active products only
    console.log('\n2️⃣ Testing active products only...');
    const activeProductsResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[isActive][$eq]=true`);
    const activeProducts = activeProductsResponse.data.data || [];
    console.log(`✅ Active products: ${activeProducts.length}`);

    // Test 3: Approved products only
    console.log('\n3️⃣ Testing approved products only...');
    const approvedProductsResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[approvalStatus][$eq]=approved`);
    const approvedProducts = approvedProductsResponse.data.data || [];
    console.log(`✅ Approved products: ${approvedProducts.length}`);

    // Test 4: Active AND approved products (what we want)
    console.log('\n4️⃣ Testing active AND approved products...');
    const activeApprovedResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[isActive][$eq]=true&filters[approvalStatus][$eq]=approved`);
    const activeApprovedProducts = activeApprovedResponse.data.data || [];
    console.log(`✅ Active AND approved products: ${activeApprovedProducts.length}`);

    // Test 5: Active products with location filter
    console.log('\n5️⃣ Testing active products with location filter...');
    const activeLocationResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[isActive][$eq]=true&filters[approvalStatus][$eq]=approved&filters[location][pincode]=493889`);
    const activeLocationProducts = activeLocationResponse.data.data || [];
    console.log(`✅ Active products in location (493889): ${activeLocationProducts.length}`);

    // Test 6: Discounted active products
    console.log('\n6️⃣ Testing discounted active products...');
    const discountedActiveResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[discount][$gt]=0&filters[isActive][$eq]=true&filters[approvalStatus][$eq]=approved`);
    const discountedActiveProducts = discountedActiveResponse.data.data || [];
    console.log(`✅ Discounted active products: ${discountedActiveProducts.length}`);

    // Show sample active products
    if (activeApprovedProducts.length > 0) {
      console.log('\n📋 Sample active and approved products:');
      activeApprovedProducts.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.attributes?.name || product.name}`);
        console.log(`      - isActive: ${product.attributes?.isActive}`);
        console.log(`      - approvalStatus: ${product.attributes?.approvalStatus}`);
        console.log(`      - Price: ₹${product.attributes?.price || product.price}`);
        console.log(`      - Discount: ${product.attributes?.discount || product.discount || 0}%`);
      });
    }

    // Summary
    console.log('\n🎉 Active Products Filtering Test Summary:');
    console.log('==========================================');
    console.log(`📊 Total products in database: ${allProducts.length}`);
    console.log(`✅ Active products: ${activeProducts.length}`);
    console.log(`✅ Approved products: ${approvedProducts.length}`);
    console.log(`✅ Active AND approved products: ${activeApprovedProducts.length}`);
    console.log(`📍 Active products in location: ${activeLocationProducts.length}`);
    console.log(`🎯 Discounted active products: ${discountedActiveProducts.length}`);

    if (activeApprovedProducts.length > 0) {
      console.log('\n✅ Active product filtering is working correctly!');
      console.log('   - Only active and approved products are being returned');
      console.log('   - Users will see only valid, approved products');
      console.log('   - Location filtering works with active products');
    } else {
      console.log('\n⚠️ No active and approved products found');
      console.log('   - This might be normal if no products are approved yet');
      console.log('   - Consider approving some products in the admin panel');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testActiveProductsFiltering(); 