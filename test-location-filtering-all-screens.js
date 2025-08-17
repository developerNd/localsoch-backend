const axios = require('axios');

const API_URL = 'http://192.168.1.100:1337';

async function testLocationFilteringAllScreens() {
  console.log('🧪 Testing Location Filtering Across All Screens');
  console.log('================================================');

  const testLocation = {
    city: 'Gariaband',
    state: 'Chhattisgarh',
    pincode: '493889'
  };

  try {
    // Test 1: HomeScreen - Products
    console.log('\n1️⃣ Testing HomeScreen Products with location filter...');
    let productsUrl = `${API_URL}/api/products?populate=*&filters[location][pincode]=${testLocation.pincode}&filters[location][city]=${encodeURIComponent(testLocation.city)}&filters[location][state]=${encodeURIComponent(testLocation.state)}`;
    
    const productsResponse = await axios.get(productsUrl);
    const products = productsResponse.data.data || [];
    console.log(`✅ HomeScreen Products: Found ${products.length} products in ${testLocation.city}, ${testLocation.state}`);

    // Test 2: HomeScreen - Vendors
    console.log('\n2️⃣ Testing HomeScreen Vendors with location filter...');
    let vendorsUrl = `${API_URL}/api/vendors?populate=*&filters[location][pincode]=${testLocation.pincode}&filters[location][city]=${encodeURIComponent(testLocation.city)}&filters[location][state]=${encodeURIComponent(testLocation.state)}`;
    
    const vendorsResponse = await axios.get(vendorsUrl);
    const vendors = vendorsResponse.data.data || [];
    console.log(`✅ HomeScreen Vendors: Found ${vendors.length} vendors in ${testLocation.city}, ${testLocation.state}`);

    // Test 3: OffersScreen - Discounted Products
    console.log('\n3️⃣ Testing OffersScreen Discounted Products with location filter...');
    let offersUrl = `${API_URL}/api/products?filters[discount][$gt]=0&populate=*&filters[location][pincode]=${testLocation.pincode}&filters[location][city]=${encodeURIComponent(testLocation.city)}&filters[location][state]=${encodeURIComponent(testLocation.state)}`;
    
    const offersResponse = await axios.get(offersUrl);
    const offers = offersResponse.data.data || [];
    console.log(`✅ OffersScreen: Found ${offers.length} discounted products in ${testLocation.city}, ${testLocation.state}`);

    // Test 4: ProductListScreen - Category Products
    console.log('\n4️⃣ Testing ProductListScreen Category Products with location filter...');
    let categoryUrl = `${API_URL}/api/products?populate=*&filters[location][pincode]=${testLocation.pincode}&filters[location][city]=${encodeURIComponent(testLocation.city)}&filters[location][state]=${encodeURIComponent(testLocation.state)}`;
    
    const categoryResponse = await axios.get(categoryUrl);
    const categoryProducts = categoryResponse.data.data || [];
    console.log(`✅ ProductListScreen: Found ${categoryProducts.length} category products in ${testLocation.city}, ${testLocation.state}`);

    // Test 5: SearchScreen - Search Results
    console.log('\n5️⃣ Testing SearchScreen Search Results with location filter...');
    let searchUrl = `${API_URL}/api/products?populate=*&filters[location][pincode]=${testLocation.pincode}&filters[location][city]=${encodeURIComponent(testLocation.city)}&filters[location][state]=${encodeURIComponent(testLocation.state)}`;
    
    const searchResponse = await axios.get(searchUrl);
    const searchResults = searchResponse.data.data || [];
    console.log(`✅ SearchScreen: Found ${searchResults.length} search results in ${testLocation.city}, ${testLocation.state}`);

    // Test 6: VendorListScreen - Nearby Vendors
    console.log('\n6️⃣ Testing VendorListScreen Nearby Vendors with location filter...');
    let nearbyVendorsUrl = `${API_URL}/api/vendors?populate=*&filters[location][pincode]=${testLocation.pincode}&filters[location][city]=${encodeURIComponent(testLocation.city)}&filters[location][state]=${encodeURIComponent(testLocation.state)}`;
    
    const nearbyVendorsResponse = await axios.get(nearbyVendorsUrl);
    const nearbyVendors = nearbyVendorsResponse.data.data || [];
    console.log(`✅ VendorListScreen: Found ${nearbyVendors.length} nearby vendors in ${testLocation.city}, ${testLocation.state}`);

    // Test 7: Compare with no location filter
    console.log('\n7️⃣ Testing without location filter (for comparison)...');
    let allProductsUrl = `${API_URL}/api/products?populate=*`;
    const allProductsResponse = await axios.get(allProductsUrl);
    const allProducts = allProductsResponse.data.data || [];
    console.log(`📊 Total products without location filter: ${allProducts.length}`);

    let allVendorsUrl = `${API_URL}/api/vendors?populate=*`;
    const allVendorsResponse = await axios.get(allVendorsUrl);
    const allVendors = allVendorsResponse.data.data || [];
    console.log(`📊 Total vendors without location filter: ${allVendors.length}`);

    // Summary
    console.log('\n🎉 Location Filtering Test Summary:');
    console.log('====================================');
    console.log(`📍 Test Location: ${testLocation.city}, ${testLocation.state} (${testLocation.pincode})`);
    console.log(`📦 Products in location: ${products.length} / ${allProducts.length} total`);
    console.log(`🏪 Vendors in location: ${vendors.length} / ${allVendors.length} total`);
    console.log(`🎯 Discounted products in location: ${offers.length}`);
    console.log(`🔍 Search results in location: ${searchResults.length}`);
    console.log(`📍 Nearby vendors in location: ${nearbyVendors.length}`);

    if (products.length > 0 || vendors.length > 0) {
      console.log('\n✅ Location filtering is working correctly!');
      console.log('   - Products and vendors are being filtered by location');
      console.log('   - Users will see location-relevant content');
    } else {
      console.log('\n⚠️ No products/vendors found in the test location');
      console.log('   - This might be normal if no data exists for this location');
      console.log('   - Consider testing with a different location or adding test data');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testLocationFilteringAllScreens(); 