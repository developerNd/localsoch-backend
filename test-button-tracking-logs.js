const axios = require('axios');

const STRAPI_URL = 'https://api.localsoch.com';

// Test button tracking with detailed logging
async function testButtonTrackingLogs() {
  try {
    console.log('🔍 TESTING BUTTON TRACKING WITH BACKEND LOGS');
    console.log('===========================================\n');

    // Test call button tracking from SellerScreen
    console.log('1. Testing SellerScreen call button tracking...');
    
    const callTrackingResponse = await axios.put(`${STRAPI_URL}/api/vendors/4`, {
      trackClick: true,
      buttonType: 'call',
      userInfo: {
        name: 'Test User SellerScreen',
        phone: '+91 98765 43210',
        email: 'test.seller@example.com',
        userId: '123',
        isGuest: false
      },
      deviceInfo: {
        platform: 'android',
        appVersion: '1.0.0',
        deviceModel: 'Test Device',
        osVersion: 'Test OS'
      },
      location: 'SellerScreen',
      userAgent: 'React Native App - SellerScreen',
      ipAddress: '192.168.1.100'
    });

    console.log('✅ Call button tracking response:', callTrackingResponse.data);

    // Wait a moment for backend processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test WhatsApp button tracking from SellerScreen
    console.log('\n2. Testing SellerScreen WhatsApp button tracking...');
    
    const whatsappTrackingResponse = await axios.put(`${STRAPI_URL}/api/vendors/4`, {
      trackClick: true,
      buttonType: 'whatsapp',
      userInfo: {
        name: 'Test User SellerScreen',
        phone: '+91 98765 43210',
        email: 'test.seller@example.com',
        userId: '123',
        isGuest: false
      },
      deviceInfo: {
        platform: 'android',
        appVersion: '1.0.0',
        deviceModel: 'Test Device',
        osVersion: 'Test OS'
      },
      location: 'SellerScreen',
      userAgent: 'React Native App - SellerScreen',
      ipAddress: '192.168.1.100'
    });

    console.log('✅ WhatsApp button tracking response:', whatsappTrackingResponse.data);

    // Wait a moment for backend processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check the latest logs
    console.log('\n3. Checking latest button click logs...');
    const logsResponse = await axios.get(`${STRAPI_URL}/api/button-click-logs?sort=createdAt:desc&pagination[limit]=2&populate=*`);
    
    if (logsResponse.data.data && logsResponse.data.data.length > 0) {
      console.log('✅ Latest logs found:', logsResponse.data.data.length);
      
      logsResponse.data.data.forEach((log, index) => {
        console.log(`\n📋 Log ${index + 1}:`);
        console.log('  - ID:', log.id);
        console.log('  - Button Type:', log.buttonType);
        console.log('  - Clicked At:', log.clickedAt);
        console.log('  - IP Address:', log.ipAddress);
        console.log('  - User Agent:', log.userAgent);
        
        if (log.userInfo) {
          console.log('  - User Info:', log.userInfo);
        } else {
          console.log('  - User Info: ❌ Missing');
        }
        
        if (log.deviceInfo) {
          console.log('  - Device Info:', log.deviceInfo);
        } else {
          console.log('  - Device Info: ❌ Missing');
        }
        
        if (log.vendor) {
          console.log('  - Vendor:', log.vendor.name);
        } else {
          console.log('  - Vendor: ❌ Missing');
        }
      });
    } else {
      console.log('❌ No logs found');
    }

    console.log('\n🎉 BUTTON TRACKING LOGS TEST COMPLETED');
    console.log('=====================================');
    console.log('\n📋 Check your backend server logs to see the detailed tracking data!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testButtonTrackingLogs(); 