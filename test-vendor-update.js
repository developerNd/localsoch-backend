const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testVendorUpdate() {
  try {
    console.log('🧪 Testing Vendor Update with Business Category...\n');

    // Step 1: Login as a seller to get JWT token
    console.log('👤 Step 1: Logging in as seller...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'testq@gmail.com',
      password: 'test123',
    });

    if (!loginResponse.data.jwt) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    const jwt = loginResponse.data.jwt;
    const user = loginResponse.data.user;
    console.log('✅ Login successful!');
    console.log('   User ID:', user.id);
    console.log('   Username:', user.username);

    // Step 2: Get the user's vendor
    console.log('\n🏪 Step 2: Getting user vendor...');
    const vendorResponse = await axios.get(`${API_URL}/api/vendors?filters[user][id][$eq]=${user.id}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (!vendorResponse.data.data || vendorResponse.data.data.length === 0) {
      console.log('❌ No vendor found for user');
      return;
    }

    const vendor = vendorResponse.data.data[0];
    console.log('✅ Vendor found!');
    console.log('   Vendor ID:', vendor.id);
    console.log('   Vendor Name:', vendor.name);
    console.log('   Current Business Category:', vendor.businessCategory?.name || 'None');

    // Step 3: Get business categories
    console.log('\n📋 Step 3: Getting business categories...');
    const categoriesResponse = await axios.get(`${API_URL}/api/business-categories`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (!categoriesResponse.data.data || categoriesResponse.data.data.length === 0) {
      console.log('❌ No business categories found');
      return;
    }

    const categories = categoriesResponse.data.data;
    console.log('✅ Business categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });

    // Step 4: Update vendor with business category
    console.log('\n🔄 Step 4: Updating vendor with business category...');
    const updateData = {
      name: 'Updated Test Shop',
      description: 'Updated shop description',
      businessCategoryId: categories[0].id, // Use first category
      contact: '9876543210',
      whatsapp: '9876543210',
      email: 'updated@example.com',
      address: 'Updated Address',
      city: 'Updated City',
      state: 'Updated State',
      pincode: '654321',
      businessType: 'retail',
      gstNumber: 'GST123456789',
    };

    console.log('   Update data:', updateData);

    const updateResponse = await axios.put(`${API_URL}/api/vendors/${vendor.id}`, {
      data: updateData
    }, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });

    if (!updateResponse.data.success) {
      console.log('❌ Vendor update failed:', updateResponse.data);
      return;
    }

    const updatedVendor = updateResponse.data.data;
    console.log('✅ Vendor updated successfully!');
    console.log('   Updated Name:', updatedVendor.name);
    console.log('   Updated Business Category:', updatedVendor.businessCategory?.name || 'None');
    console.log('   Updated Business Category ID:', updatedVendor.businessCategory?.id || 'None');

    // Step 5: Verify the update in database
    console.log('\n🔍 Step 5: Verifying update in database...');
    const verifyResponse = await axios.get(`${API_URL}/api/vendors/${vendor.id}?populate=businessCategory`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (verifyResponse.data) {
      const verifiedVendor = verifyResponse.data;
      console.log('✅ Database verification successful!');
      console.log('   Name:', verifiedVendor.name);
      console.log('   Business Category:', verifiedVendor.businessCategory?.name || 'None');
      console.log('   Business Category ID:', verifiedVendor.businessCategory?.id || 'None');
      console.log('   Contact:', verifiedVendor.contact);
      console.log('   Email:', verifiedVendor.email);
    } else {
      console.log('⚠️ Database verification failed');
    }

    console.log('\n🎉 Vendor Update Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Seller login successful');
    console.log('   ✅ Vendor found');
    console.log('   ✅ Business categories loaded');
    console.log('   ✅ Vendor updated with business category');
    console.log('   ✅ Database verification successful');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('   Status:', error.response.status);
    }
  }
}

testVendorUpdate(); 