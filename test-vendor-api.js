// Test script for vendor API with review stats
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testVendorAPI() {
  try {
    console.log('🧪 Testing Vendor API with Review Stats...\n');

    // Test 1: Get all vendors
    console.log('1️⃣ Getting All Vendors...');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`);
      console.log('✅ Vendors endpoint working');
      console.log('📊 Total vendors:', vendorsResponse.data.data?.length || 0);
      
      if (vendorsResponse.data.data && vendorsResponse.data.data.length > 0) {
        console.log('📝 Sample vendor data:');
        const sampleVendor = vendorsResponse.data.data[0];
        console.log(`  ID: ${sampleVendor.id}`);
        console.log(`  Name: ${sampleVendor.name || sampleVendor.shopName}`);
        console.log(`  Rating: ${sampleVendor.rating || 'N/A'}`);
        console.log(`  Average Rating: ${sampleVendor.averageRating || 'N/A'}`);
        console.log(`  Total Reviews: ${sampleVendor.totalReviews || 'N/A'}`);
        console.log(`  Products Count: ${sampleVendor.productsCount || 'N/A'}`);
        console.log(`  Products Array Length: ${sampleVendor.products?.length || 'N/A'}`);
      }
    } catch (error) {
      console.log('❌ Vendors endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 2: Get specific vendor by ID
    console.log('\n2️⃣ Getting Specific Vendor...');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`);
      
      if (vendorsResponse.data.data && vendorsResponse.data.data.length > 0) {
        const vendorId = vendorsResponse.data.data[0].id;
        console.log(`🔍 Testing vendor ID: ${vendorId}`);
        
        const vendorResponse = await axios.get(`${API_URL}/api/vendors/${vendorId}?populate=*`);
        
        if (vendorResponse.data.data) {
          const vendor = vendorResponse.data.data;
          console.log('✅ Specific vendor data:');
          console.log(`  ID: ${vendor.id}`);
          console.log(`  Name: ${vendor.name || vendor.shopName}`);
          console.log(`  Rating: ${vendor.rating || 'N/A'}`);
          console.log(`  Average Rating: ${vendor.averageRating || 'N/A'}`);
          console.log(`  Total Reviews: ${vendor.totalReviews || 'N/A'}`);
          console.log(`  Products Count: ${vendor.productsCount || 'N/A'}`);
          console.log(`  Products Array Length: ${vendor.products?.length || 'N/A'}`);
          
          if (vendor.reviewStats) {
            console.log(`  Review Stats:`, vendor.reviewStats);
          }
        }
      }
    } catch (error) {
      console.log('❌ Specific vendor endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 3: Get reviews for a vendor
    console.log('\n3️⃣ Getting Reviews for Vendor...');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`);
      
      if (vendorsResponse.data.data && vendorsResponse.data.data.length > 0) {
        const vendorId = vendorsResponse.data.data[0].id;
        console.log(`🔍 Getting reviews for vendor ID: ${vendorId}`);
        
        const reviewsResponse = await axios.get(`${API_URL}/api/reviews?filters[vendor][$eq]=${vendorId}&populate=*`);
        
        console.log('✅ Reviews data:');
        console.log(`  Total reviews: ${reviewsResponse.data.data?.length || 0}`);
        
        if (reviewsResponse.data.data && reviewsResponse.data.data.length > 0) {
          console.log('📝 Sample reviews:');
          reviewsResponse.data.data.slice(0, 3).forEach((review, index) => {
            console.log(`  ${index + 1}. Rating: ${review.rating}, Comment: ${review.comment?.substring(0, 50)}...`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Reviews endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Vendor API Test Complete!');
    console.log('\n📋 Summary:');
    console.log('1. Check if vendors are returning rating, averageRating, totalReviews, and productsCount');
    console.log('2. Check if specific vendor endpoint includes review stats');
    console.log('3. Verify that review data exists in the database');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testVendorAPI(); 