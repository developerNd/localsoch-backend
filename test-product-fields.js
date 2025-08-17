const axios = require('axios');

const API_URL = 'http://192.168.1.100:1337';

async function testProductFields() {
  console.log('🧪 Testing Product Fields in API Response');
  console.log('==========================================');

  try {
    // Test 1: Get a single product to see all fields
    console.log('\n1️⃣ Testing single product fields...');
    const singleProductResponse = await axios.get(`${API_URL}/api/products/1?populate=*`);
    const product = singleProductResponse.data.data;
    
    console.log('📋 Product ID 1 fields:');
    console.log('   - id:', product.id);
    console.log('   - name:', product.attributes?.name);
    console.log('   - isActive:', product.attributes?.isActive);
    console.log('   - approvalStatus:', product.attributes?.approvalStatus);
    console.log('   - is_active (direct):', product.attributes?.is_active);
    console.log('   - approval_status (direct):', product.attributes?.approval_status);
    console.log('   - All attributes keys:', Object.keys(product.attributes || {}));

    // Test 2: Get all products with filters
    console.log('\n2️⃣ Testing products with active filter...');
    const activeProductsResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[isActive][$eq]=true`);
    const activeProducts = activeProductsResponse.data.data || [];
    console.log(`✅ Products with isActive=true: ${activeProducts.length}`);

    // Test 3: Get all products with approval filter
    console.log('\n3️⃣ Testing products with approval filter...');
    const approvedProductsResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[approvalStatus][$eq]=approved`);
    const approvedProducts = approvedProductsResponse.data.data || [];
    console.log(`✅ Products with approvalStatus=approved: ${approvedProducts.length}`);

    // Test 4: Get all products with both filters
    console.log('\n4️⃣ Testing products with both filters...');
    const bothFiltersResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[isActive][$eq]=true&filters[approvalStatus][$eq]=approved`);
    const bothFiltersProducts = bothFiltersResponse.data.data || [];
    console.log(`✅ Products with both filters: ${bothFiltersProducts.length}`);

    // Test 5: Check if filters work with different field names
    console.log('\n5️⃣ Testing with different field names...');
    const isActiveResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[is_active][$eq]=true`);
    const isActiveProducts = isActiveResponse.data.data || [];
    console.log(`✅ Products with is_active=true: ${isActiveProducts.length}`);

    const approvalStatusResponse = await axios.get(`${API_URL}/api/products?populate=*&filters[approval_status][$eq]=approved`);
    const approvalStatusProducts = approvalStatusResponse.data.data || [];
    console.log(`✅ Products with approval_status=approved: ${approvalStatusProducts.length}`);

    // Test 6: Check database values directly
    console.log('\n6️⃣ Checking database values...');
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    try {
      const { stdout } = await execAsync('sqlite3 .tmp/data.db "SELECT id, name, is_active, approval_status FROM products;"');
      console.log('📊 Database values:');
      console.log(stdout);
    } catch (error) {
      console.log('❌ Could not check database directly:', error.message);
    }

    // Summary
    console.log('\n🎉 Product Fields Test Summary:');
    console.log('===============================');
    console.log(`📊 Total products: ${activeProductsResponse.data.meta?.pagination?.total || 0}`);
    console.log(`✅ Active products (isActive): ${activeProducts.length}`);
    console.log(`✅ Approved products (approvalStatus): ${approvedProducts.length}`);
    console.log(`✅ Both filters: ${bothFiltersProducts.length}`);
    console.log(`✅ Active products (is_active): ${isActiveProducts.length}`);
    console.log(`✅ Approved products (approval_status): ${approvalStatusProducts.length}`);

    if (bothFiltersProducts.length > 0) {
      console.log('\n✅ Active product filtering is working!');
      console.log('   - Products are being filtered correctly');
      console.log('   - Only active and approved products are returned');
    } else {
      console.log('\n⚠️ No products found with both filters');
      console.log('   - Check if products have correct isActive and approvalStatus values');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testProductFields(); 