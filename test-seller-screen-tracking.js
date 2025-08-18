const axios = require('axios');

const STRAPI_URL = 'https://api.localsoch.com';

// Test SellerScreen button tracking specifically
async function testSellerScreenTracking() {
  try {
    console.log('🔍 TESTING SELLER SCREEN BUTTON TRACKING');
    console.log('========================================\n');

    // Get vendor data first
    console.log('1. Getting vendor data...');
    const vendorResponse = await axios.get(`${STRAPI_URL}/api/vendors/4?populate=*`);
    
    if (vendorResponse.data.data) {
      const vendor = vendorResponse.data.data;
      console.log(`✅ Vendor found: ${vendor.name} (ID: ${vendor.id})`);
      console.log(`📊 Current button clicks:`, vendor.buttonClicks);
    }

    // Test call button tracking (simulating SellerScreen)
    console.log('\n2. Testing SellerScreen call button tracking...');
    
    const callTrackingResponse = await axios.put(`${STRAPI_URL}/api/vendors/4`, {
      trackClick: true,
      buttonType: 'call',
      userInfo: {
        name: 'Test User',
        phone: '+91 98765 43210',
        email: 'test@example.com',
        userId: '123',
        isGuest: false
      },
      deviceInfo: {
        platform: 'React Native',
        appVersion: '1.0.0',
        deviceModel: 'Mobile App',
        osVersion: 'Unknown'
      },
      location: 'Mobile App',
      userAgent: 'React Native App'
    });

    console.log('✅ Call button tracking response:', callTrackingResponse.data);

    // Test WhatsApp button tracking (simulating SellerScreen)
    console.log('\n3. Testing SellerScreen WhatsApp button tracking...');
    
    const whatsappTrackingResponse = await axios.put(`${STRAPI_URL}/api/vendors/4`, {
      trackClick: true,
      buttonType: 'whatsapp',
      userInfo: {
        name: 'Test User',
        phone: '+91 98765 43210',
        email: 'test@example.com',
        userId: '123',
        isGuest: false
      },
      deviceInfo: {
        platform: 'React Native',
        appVersion: '1.0.0',
        deviceModel: 'Mobile App',
        osVersion: 'Unknown'
      },
      location: 'Mobile App',
      userAgent: 'React Native App'
    });

    console.log('✅ WhatsApp button tracking response:', whatsappTrackingResponse.data);

    // Check updated vendor data
    console.log('\n4. Checking updated vendor data...');
    const updatedVendorResponse = await axios.get(`${STRAPI_URL}/api/vendors/4?populate=*`);
    
    if (updatedVendorResponse.data.data) {
      const updatedVendor = updatedVendorResponse.data.data;
      console.log(`✅ Updated vendor: ${updatedVendor.name} (ID: ${updatedVendor.id})`);
      console.log(`📊 Updated button clicks:`, updatedVendor.buttonClicks);
    }

    console.log('\n🎉 SELLER SCREEN TRACKING TEST COMPLETED');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSellerScreenTracking(); 