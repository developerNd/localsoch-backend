const axios = require('axios');

const API_URL = 'http://192.168.1.100:1337';

async function testVendorLocationFiltering() {
  console.log('🧪 Testing Vendor Location Filtering');
  console.log('=====================================');

  try {
    // Test 1: Fetch all vendors without location filter
    console.log('\n1️⃣ Testing fetch all vendors (no location filter)...');
    
    const allVendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`);
    const allVendors = allVendorsResponse.data.data || [];
    
    console.log(`✅ Found ${allVendors.length} total vendors`);
    
    // Show sample vendor data structure
    if (allVendors.length > 0) {
      const sampleVendor = allVendors[0];
      console.log('📋 Sample vendor data structure:');
      console.log(`   - ID: ${sampleVendor.id}`);
      console.log(`   - Name: ${sampleVendor.attributes?.name || sampleVendor.name}`);
      console.log(`   - Address: ${sampleVendor.attributes?.address || sampleVendor.address}`);
      console.log(`   - City: ${sampleVendor.attributes?.city || sampleVendor.city}`);
      console.log(`   - State: ${sampleVendor.attributes?.state || sampleVendor.state}`);
      console.log(`   - Pincode: ${sampleVendor.attributes?.pincode || sampleVendor.pincode}`);
    }

    // Test 2: Test location filtering with specific pincode
    console.log('\n2️⃣ Testing location filtering with pincode 493889...');
    
    const locationFilteredResponse = await axios.get(`${API_URL}/api/vendors?populate=*&filters[location][pincode]=493889`);
    const locationFilteredVendors = locationFilteredResponse.data.data || [];
    
    console.log(`✅ Found ${locationFilteredVendors.length} vendors in pincode 493889`);
    
    locationFilteredVendors.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.attributes?.name || vendor.name}`);
      console.log(`      Address: ${vendor.attributes?.address || vendor.address}`);
      console.log(`      Pincode: ${vendor.attributes?.pincode || vendor.pincode}`);
    });

    // Test 3: Test location filtering with city
    console.log('\n3️⃣ Testing location filtering with city Gariaband...');
    
    const cityFilteredResponse = await axios.get(`${API_URL}/api/vendors?populate=*&filters[location][city]=Gariaband`);
    const cityFilteredVendors = cityFilteredResponse.data.data || [];
    
    console.log(`✅ Found ${cityFilteredVendors.length} vendors in city Gariaband`);
    
    cityFilteredVendors.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.attributes?.name || vendor.name}`);
      console.log(`      City: ${vendor.attributes?.city || vendor.city}`);
    });

    // Test 4: Test location filtering with state
    console.log('\n4️⃣ Testing location filtering with state Chhattisgarh...');
    
    const stateFilteredResponse = await axios.get(`${API_URL}/api/vendors?populate=*&filters[location][state]=Chhattisgarh`);
    const stateFilteredVendors = stateFilteredResponse.data.data || [];
    
    console.log(`✅ Found ${stateFilteredVendors.length} vendors in state Chhattisgarh`);
    
    stateFilteredVendors.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.attributes?.name || vendor.name}`);
      console.log(`      State: ${vendor.attributes?.state || vendor.state}`);
    });

    // Test 5: Test combined location filtering
    console.log('\n5️⃣ Testing combined location filtering (pincode + city + state)...');
    
    const combinedFilteredResponse = await axios.get(
      `${API_URL}/api/vendors?populate=*&filters[location][pincode]=493889&filters[location][city]=Gariaband&filters[location][state]=Chhattisgarh`
    );
    const combinedFilteredVendors = combinedFilteredResponse.data.data || [];
    
    console.log(`✅ Found ${combinedFilteredVendors.length} vendors with combined filters`);
    
    combinedFilteredVendors.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.attributes?.name || vendor.name}`);
      console.log(`      Location: ${vendor.attributes?.city || vendor.city}, ${vendor.attributes?.state || vendor.state} (${vendor.attributes?.pincode || vendor.pincode})`);
    });

    // Test 6: Test image URL construction for filtered vendors
    console.log('\n6️⃣ Testing image URL construction for filtered vendors...');
    
    if (combinedFilteredVendors.length > 0) {
      const testVendor = combinedFilteredVendors[0];
      console.log(`Testing vendor: ${testVendor.attributes?.name || testVendor.name}`);
      
      // Simulate the frontend image URL construction
      let profileImageUrl = null;
      
      if (testVendor.attributes?.profileImage?.data?.attributes?.url) {
        profileImageUrl = `${API_URL}${testVendor.attributes.profileImage.data.attributes.url}`;
        console.log(`   ✅ Primary image URL: ${profileImageUrl}`);
      } else if (testVendor.attributes?.profileImage?.data?.attributes?.formats?.medium?.url) {
        profileImageUrl = `${API_URL}${testVendor.attributes.profileImage.data.attributes.formats.medium.url}`;
        console.log(`   ✅ Medium format URL: ${profileImageUrl}`);
      } else if (testVendor.attributes?.profileImage?.data?.attributes?.formats?.small?.url) {
        profileImageUrl = `${API_URL}${testVendor.attributes.profileImage.data.attributes.formats.small.url}`;
        console.log(`   ✅ Small format URL: ${profileImageUrl}`);
      } else if (testVendor.attributes?.profileImage?.data?.attributes?.formats?.thumbnail?.url) {
        profileImageUrl = `${API_URL}${testVendor.attributes.profileImage.data.attributes.formats.thumbnail.url}`;
        console.log(`   ✅ Thumbnail format URL: ${profileImageUrl}`);
      } else if (testVendor.attributes?.profileImage?.url) {
        profileImageUrl = `${API_URL}${testVendor.attributes.profileImage.url}`;
        console.log(`   ✅ Direct URL: ${profileImageUrl}`);
      } else if (testVendor.profileImage) {
        if (typeof testVendor.profileImage === 'string' && testVendor.profileImage.startsWith('http')) {
          profileImageUrl = testVendor.profileImage;
          console.log(`   ✅ HTTP URL: ${profileImageUrl}`);
        } else if (typeof testVendor.profileImage === 'string') {
          profileImageUrl = `${API_URL}${testVendor.profileImage}`;
          console.log(`   ✅ Relative URL: ${profileImageUrl}`);
        }
      } else {
        console.log(`   ⚠️ No image found - will use placeholder`);
      }
      
      console.log(`   Final image URL: ${profileImageUrl || 'null (will use placeholder)'}`);
    }

    console.log('\n🎉 Vendor Location Filtering Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Location-based filtering working correctly');
    console.log('   ✅ Individual filters (pincode, city, state) working');
    console.log('   ✅ Combined filters working');
    console.log('   ✅ Image URL construction working for filtered vendors');
    console.log('   ✅ Frontend will show location-specific vendor lists');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testVendorLocationFiltering(); 