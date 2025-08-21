// Test script for review stats API
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testReviewStats() {
  try {
    console.log('🧪 Testing Review Stats API...\n');

    // Test 1: Get all reviews
    console.log('1️⃣ Getting All Reviews...');
    try {
      const reviewsResponse = await axios.get(`${API_URL}/api/reviews?populate=*`);
      console.log('✅ Reviews endpoint working');
      console.log('📊 Total reviews:', reviewsResponse.data.data?.length || 0);
      
      if (reviewsResponse.data.data && reviewsResponse.data.data.length > 0) {
        console.log('📝 Sample reviews:');
        reviewsResponse.data.data.slice(0, 3).forEach((review, index) => {
          console.log(`  ${index + 1}. Rating: ${review.attributes.rating}, Vendor: ${review.attributes.vendor?.data?.id || 'N/A'}`);
        });
      }
    } catch (error) {
      console.log('❌ Reviews endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 2: Get vendors
    console.log('\n2️⃣ Getting Vendors...');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`);
      console.log('✅ Vendors endpoint working');
      console.log('📊 Total vendors:', vendorsResponse.data.data?.length || 0);
      
      if (vendorsResponse.data.data && vendorsResponse.data.data.length > 0) {
        console.log('🏪 Vendors:');
        vendorsResponse.data.data.forEach((vendor, index) => {
          console.log(`  ${index + 1}. ${vendor.attributes.name || vendor.attributes.shopName} (ID: ${vendor.id})`);
        });
      }
    } catch (error) {
      console.log('❌ Vendors endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 3: Test review stats for each vendor
    console.log('\n3️⃣ Testing Review Stats for Each Vendor...');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`);
      
      if (vendorsResponse.data.data && vendorsResponse.data.data.length > 0) {
        for (const vendor of vendorsResponse.data.data) {
          const vendorId = vendor.id;
          console.log(`\n🔍 Testing vendor ID: ${vendorId} (${vendor.attributes.name || vendor.attributes.shopName})`);
          
          // Test seller reviews endpoint
          try {
            const sellerReviewsResponse = await axios.get(`${API_URL}/api/reviews/seller/${vendorId}?populate=*`);
            console.log(`  ✅ Seller reviews: ${sellerReviewsResponse.data.data?.length || 0} reviews`);
          } catch (error) {
            console.log(`  ❌ Seller reviews failed: ${error.response?.status || error.message}`);
          }
          
          // Test seller stats endpoint
          try {
            const sellerStatsResponse = await axios.get(`${API_URL}/api/reviews/seller/${vendorId}/stats?populate=*`);
            console.log(`  ✅ Seller stats:`, sellerStatsResponse.data.data || sellerStatsResponse.data);
          } catch (error) {
            console.log(`  ❌ Seller stats failed: ${error.response?.status || error.message}`);
          }
        }
      }
    } catch (error) {
      console.log('❌ Review stats test failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Review Stats Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check the console logs above for any errors');
    console.log('2. Verify that review stats are being returned correctly');
    console.log('3. Check if the vendor ID in the mobile app matches the backend');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testReviewStats(); 