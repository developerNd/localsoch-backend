const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testBusinessCategoryRelation() {
  try {
    console.log('🔍 Testing business category relation formats...');
    
    // First, let's check what business categories exist
    console.log('\n📋 Available business categories:');
    const categoriesResponse = await axios.get(`${API_URL}/api/business-categories`);
    console.log('Categories:', categoriesResponse.data.data);
    
    // Test different business category relation formats
    const formats = [
      { businessCategory: 2 }, // Direct ID
      { businessCategory: "2" }, // String ID
      { businessCategory: { id: 2 } }, // Object with ID
      { businessCategory: { connect: [2] } }, // Connect format
      { businessCategory: { set: [2] } }, // Set format
      { businessCategory: { connect: [{ id: 2 }] } } // Connect with object
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
        
        console.log('📋 Test payload:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post(`${API_URL}/api/vendors`, testData);
        console.log('✅ Success with format:', format);
        console.log('Response:', response.data);
        break;
      } catch (error) {
        console.log('❌ Failed with format:', format);
        console.log('Error:', error.response?.data?.error?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBusinessCategoryRelation(); 