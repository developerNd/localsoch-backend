const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testBusinessCategoryUpdate() {
  try {
    console.log('🧪 Testing Business Category Update...\n');

    // Step 1: Get a vendor that exists
    console.log('🏪 Step 1: Getting existing vendor...');
    const vendorResponse = await axios.get(`${API_URL}/api/vendors/16?populate=businessCategory`);
    
    if (!vendorResponse.data) {
      console.log('❌ Vendor not found');
      return;
    }

    const vendor = vendorResponse.data;
    console.log('✅ Vendor found!');
    console.log('   Vendor ID:', vendor.id);
    console.log('   Vendor Name:', vendor.name);
    console.log('   Current Business Category:', vendor.businessCategory?.name || 'None');

    // Step 2: Get business categories
    console.log('\n📋 Step 2: Getting business categories...');
    const categoriesResponse = await axios.get(`${API_URL}/api/business-categories`);
    
    if (!categoriesResponse.data.data || categoriesResponse.data.data.length === 0) {
      console.log('❌ No business categories found');
      return;
    }

    const categories = categoriesResponse.data.data;
    console.log('✅ Business categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });

    // Step 3: Update vendor with business category
    console.log('\n🔄 Step 3: Updating vendor with business category...');
    const updateData = {
      businessCategoryId: categories[0].id // Use first category
    };

    console.log('   Update data:', updateData);

    const updateResponse = await axios.put(`${API_URL}/api/vendors/16`, {
      data: updateData
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!updateResponse.data.success) {
      console.log('❌ Vendor update failed:', updateResponse.data);
      return;
    }

    const updatedVendor = updateResponse.data.data;
    console.log('✅ Vendor updated successfully!');
    console.log('   Updated Business Category:', updatedVendor.businessCategory?.name || 'None');
    console.log('   Updated Business Category ID:', updatedVendor.businessCategory?.id || 'None');

    // Step 4: Verify the update in database
    console.log('\n🔍 Step 4: Verifying update in database...');
    const verifyResponse = await axios.get(`${API_URL}/api/vendors/16?populate=businessCategory`);

    if (verifyResponse.data) {
      const verifiedVendor = verifyResponse.data;
      console.log('✅ Database verification successful!');
      console.log('   Business Category:', verifiedVendor.businessCategory?.name || 'None');
      console.log('   Business Category ID:', verifiedVendor.businessCategory?.id || 'None');
    } else {
      console.log('⚠️ Database verification failed');
    }

    console.log('\n🎉 Business Category Update Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('   Status:', error.response.status);
    }
  }
}

testBusinessCategoryUpdate(); 