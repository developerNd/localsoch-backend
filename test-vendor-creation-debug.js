const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testVendorCreation() {
  try {
    console.log('🔍 Testing vendor creation with business category...');
    
    // First, let's check what business categories exist
    console.log('\n📋 Available business categories:');
    const categoriesResponse = await axios.get(`${API_URL}/api/business-categories`);
    console.log('Categories:', categoriesResponse.data.data);
    
    // Test vendor creation with a valid business category ID
    const testVendorData = {
      data: {
        name: "Test Shop",
        description: "Test shop description",
        address: "Test Address",
        city: "Test City",
        state: "Test State",
        pincode: "123456",
        businessCategory: 2, // Use the Electronics category ID
        contact: "1234567890",
        whatsapp: "1234567890",
        email: "test@example.com",
        isActive: true,
        isApproved: false,
        status: 'pending'
      }
    };
    
    console.log('\n📝 Test vendor payload:');
    console.log(JSON.stringify(testVendorData, null, 2));
    
    // Try to create vendor (this will fail without auth, but we can see the error)
    console.log('\n🚀 Attempting vendor creation...');
    const vendorResponse = await axios.post(`${API_URL}/api/vendors`, testVendorData);
    
    console.log('✅ Vendor created successfully:', vendorResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data);
    
    if (error.response?.data?.error?.message?.includes('businessCategory')) {
      console.log('\n🔧 Business category error detected. Let\'s try different formats:');
      
      // Test different business category formats
      const formats = [
        { businessCategory: 2 },
        { businessCategory: "2" },
        { businessCategory: { id: 2 } },
        { businessCategory: { connect: [2] } }
      ];
      
      for (const format of formats) {
        console.log(`\n📝 Testing format:`, format);
        try {
          const testData = {
            data: {
              name: "Test Shop",
              description: "Test description",
              address: "Test Address",
              city: "Test City",
              state: "Test State",
              pincode: "123456",
              contact: "1234567890",
              whatsapp: "1234567890",
              email: "test@example.com",
              isActive: true,
              isApproved: false,
              status: 'pending',
              ...format
            }
          };
          
          const response = await axios.post(`${API_URL}/api/vendors`, testData);
          console.log('✅ Success with format:', format);
          break;
        } catch (formatError) {
          console.log('❌ Failed with format:', format, formatError.response?.data?.error?.message);
        }
      }
    }
  }
}

testVendorCreation(); 