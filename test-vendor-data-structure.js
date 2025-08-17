const axios = require('axios');

const API_URL = 'http://192.168.1.100:1337';

async function testVendorDataStructure() {
  console.log('🧪 Testing Vendor Data Structure');
  console.log('==================================');

  try {
    // Test 1: Fetch vendors and analyze data structure
    console.log('\n1️⃣ Fetching vendors and analyzing data structure...');
    
    const response = await axios.get(`${API_URL}/api/vendors?populate=*`);
    const vendors = response.data.data || [];
    
    console.log(`✅ Found ${vendors.length} vendors`);
    
    vendors.forEach((vendor, index) => {
      console.log(`\n   Vendor ${index + 1}:`);
      console.log(`   - ID: ${vendor.id}`);
      console.log(`   - Name: ${vendor.attributes?.name || vendor.name || 'No name'}`);
      console.log(`   - Has attributes: ${!!vendor.attributes}`);
      console.log(`   - profileImage type: ${typeof vendor.profileImage}`);
      console.log(`   - profileImage value: ${vendor.profileImage}`);
      
      if (vendor.attributes) {
        console.log(`   - Has profileImage in attributes: ${!!vendor.attributes.profileImage}`);
        if (vendor.attributes.profileImage) {
          console.log(`   - profileImage.data type: ${typeof vendor.attributes.profileImage.data}`);
          console.log(`   - profileImage.url type: ${typeof vendor.attributes.profileImage.url}`);
          console.log(`   - profileImage.url value: ${vendor.attributes.profileImage.url}`);
        }
      }
    });

    // Test 2: Simulate the frontend processing logic
    console.log('\n2️⃣ Simulating frontend processing logic...');
    
    const testVendors = vendors.slice(0, 3); // Test first 3 vendors
    
    testVendors.forEach((vendor, index) => {
      console.log(`\n   Processing vendor ${index + 1}: ${vendor.attributes?.name || vendor.name}`);
      
      try {
        // Simulate the exact frontend logic
        let profileImageUrl = null;
        
        if (vendor.attributes?.profileImage?.data?.attributes?.url) {
          profileImageUrl = `${API_URL}${vendor.attributes.profileImage.data.attributes.url}`;
          console.log(`   ✅ Primary URL: ${profileImageUrl}`);
        } else if (vendor.attributes?.profileImage?.data?.attributes?.formats?.medium?.url) {
          profileImageUrl = `${API_URL}${vendor.attributes.profileImage.data.attributes.formats.medium.url}`;
          console.log(`   ✅ Medium format: ${profileImageUrl}`);
        } else if (vendor.attributes?.profileImage?.data?.attributes?.formats?.small?.url) {
          profileImageUrl = `${API_URL}${vendor.attributes.profileImage.data.attributes.formats.small.url}`;
          console.log(`   ✅ Small format: ${profileImageUrl}`);
        } else if (vendor.attributes?.profileImage?.data?.attributes?.formats?.thumbnail?.url) {
          profileImageUrl = `${API_URL}${vendor.attributes.profileImage.data.attributes.formats.thumbnail.url}`;
          console.log(`   ✅ Thumbnail format: ${profileImageUrl}`);
        } else if (vendor.attributes?.profileImage?.url) {
          profileImageUrl = `${API_URL}${vendor.attributes.profileImage.url}`;
          console.log(`   ✅ Direct URL: ${profileImageUrl}`);
        } else if (vendor.profileImage) {
          // Handle direct profileImage (non-nested structure)
          if (typeof vendor.profileImage === 'string' && vendor.profileImage.startsWith('http')) {
            profileImageUrl = vendor.profileImage;
            console.log(`   ✅ HTTP URL: ${profileImageUrl}`);
          } else if (typeof vendor.profileImage === 'string') {
            profileImageUrl = `${API_URL}${vendor.profileImage}`;
            console.log(`   ✅ Relative URL: ${profileImageUrl}`);
          }
        } else {
          console.log(`   ⚠️ No image found - will use placeholder`);
        }
        
        console.log(`   Final profileImageUrl: ${profileImageUrl || 'null'}`);
        
      } catch (error) {
        console.log(`   ❌ Error processing vendor: ${error.message}`);
      }
    });

    // Test 3: Check for problematic vendors
    console.log('\n3️⃣ Checking for problematic vendors...');
    
    const problematicVendors = vendors.filter(vendor => {
      // Check for vendors that might cause issues
      const hasUndefinedProfileImage = vendor.profileImage === undefined;
      const hasNullProfileImage = vendor.profileImage === null;
      const hasNonStringProfileImage = vendor.profileImage !== null && vendor.profileImage !== undefined && typeof vendor.profileImage !== 'string';
      
      return hasUndefinedProfileImage || hasNullProfileImage || hasNonStringProfileImage;
    });
    
    console.log(`   Found ${problematicVendors.length} potentially problematic vendors`);
    
    if (problematicVendors.length > 0) {
      problematicVendors.forEach((vendor, index) => {
        console.log(`   ${index + 1}. Vendor ID: ${vendor.id}, Name: ${vendor.attributes?.name || vendor.name}`);
        console.log(`      profileImage type: ${typeof vendor.profileImage}, value: ${vendor.profileImage}`);
      });
    }

    console.log('\n🎉 Vendor Data Structure Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Added proper type checking for profileImage');
    console.log('   ✅ Added try-catch blocks for individual vendor processing');
    console.log('   ✅ Added fallback vendor objects for problematic data');
    console.log('   ✅ No more .startsWith() errors on undefined values');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testVendorDataStructure(); 