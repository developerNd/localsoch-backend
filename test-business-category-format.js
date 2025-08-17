const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testBusinessCategoryFormat() {
  try {
    console.log('🔍 Testing business category format for vendor creation...');
    
    // First, let's check what business categories exist
    console.log('\n📋 Available business categories:');
    const categoriesResponse = await axios.get(`${API_URL}/api/business-categories`);
    console.log('Categories:', JSON.stringify(categoriesResponse.data, null, 2));
    
    // Check if there are any existing vendors to see the format
    console.log('\n📋 Existing vendors:');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=businessCategory,user`);
      console.log('Vendors:', JSON.stringify(vendorsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Failed to get vendors:', error.response?.status, error.response?.data);
    }
    
    // Test creating a vendor with business category using the same format as shop settings
    console.log('\n📝 Testing vendor creation with business category...');
    
    const vendorData = {
      name: "Test Shop with Category",
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
      businessCategory: 2 // Electronics category
    };
    
    // Format like toStrapiFormat does
    const strapiData = { data: vendorData };
    
    console.log('📋 Vendor data:', JSON.stringify(vendorData, null, 2));
    console.log('📋 Strapi formatted data:', JSON.stringify(strapiData, null, 2));
    
    try {
      const response = await axios.post(`${API_URL}/api/vendors`, strapiData);
      console.log('✅ Vendor created successfully:', JSON.stringify(response.data, null, 2));
      
      // Check if the vendor was created with business category
      const createdVendor = response.data.data;
      console.log('🔍 Created vendor business category:', createdVendor.businessCategory);
      console.log('🔍 Created vendor user:', createdVendor.user);
      
    } catch (error) {
      console.log('❌ Vendor creation failed:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBusinessCategoryFormat(); 