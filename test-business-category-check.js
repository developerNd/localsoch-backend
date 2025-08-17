const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:1337';

async function checkBusinessCategories() {
  try {
    console.log('🔍 Checking business categories...');
    
    const response = await axios.get(`${API_URL}/api/business-categories`);
    
    console.log('📝 Full response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('✅ Business categories found:');
      response.data.data.forEach((category, index) => {
        console.log(`  ${index + 1}. ID: ${category.id}, Name: ${category.attributes?.name || 'No name'}`);
      });
    } else {
      console.log('❌ No business categories found');
    }
  } catch (error) {
    console.error('❌ Error checking business categories:', error.response?.data || error.message);
  }
}

async function checkVendorCreation() {
  try {
    console.log('\n🔍 Testing vendor creation payload...');
    
    // Test payload structure
    const testPayload = {
      data: {
        name: "Test Shop",
        description: "Test shop description",
        address: "Test address",
        city: "Test City",
        state: "Test State",
        pincode: "123456",
        businessCategory: 1, // Assuming business category ID 1 exists
        contact: "1234567890",
        whatsapp: "1234567890",
        email: "test@example.com",
        isActive: true,
        isApproved: false,
        status: 'pending'
      }
    };
    
    console.log('📝 Test payload structure:');
    console.log(JSON.stringify(testPayload, null, 2));
    
    // Try to create a vendor (this will fail without auth, but we can see the validation)
    try {
      const response = await axios.post(`${API_URL}/api/vendors`, testPayload);
      console.log('✅ Vendor creation test successful:', response.data);
    } catch (error) {
      console.log('❌ Vendor creation test failed (expected without auth):');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing vendor creation:', error.message);
  }
}

async function main() {
  await checkBusinessCategories();
  await checkVendorCreation();
}

main().catch(console.error); 