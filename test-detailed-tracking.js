const axios = require('axios');

const STRAPI_URL = 'https://api.localsoch.com';

// Test detailed button tracking data
async function testDetailedTracking() {
  try {
    console.log('🔍 TESTING DETAILED BUTTON TRACKING DATA');
    console.log('========================================\n');

    // Test with detailed user and device info
    console.log('1. Testing detailed tracking data...');
    
    const detailedTrackingResponse = await axios.put(`${STRAPI_URL}/api/vendors/4`, {
      trackClick: true,
      buttonType: 'call',
      userInfo: {
        name: 'Test User Detailed',
        phone: '+91 98765 43210',
        email: 'test.detailed@example.com',
        userId: '123',
        isGuest: false
      },
      deviceInfo: {
        platform: 'android',
        appVersion: '1.0.0',
        deviceModel: 'Test Device',
        osVersion: 'Test OS'
      },
      location: 'Test Location',
      userAgent: 'Test User Agent',
      ipAddress: '192.168.1.1'
    });

    console.log('✅ Detailed tracking response:', detailedTrackingResponse.data);

    // Check the latest button click log
    console.log('\n2. Checking latest button click log...');
    const logsResponse = await axios.get(`${STRAPI_URL}/api/button-click-logs?sort=createdAt:desc&pagination[limit]=1`);
    
    if (logsResponse.data.data && logsResponse.data.data.length > 0) {
      const latestLog = logsResponse.data.data[0];
      console.log('✅ Latest log entry:', latestLog);
      
      // Check if userInfo and deviceInfo are present
      if (latestLog.userInfo) {
        console.log('✅ User info found:', latestLog.userInfo);
      } else {
        console.log('❌ User info missing from log');
      }
      
      if (latestLog.deviceInfo) {
        console.log('✅ Device info found:', latestLog.deviceInfo);
      } else {
        console.log('❌ Device info missing from log');
      }
      
      if (latestLog.vendor) {
        console.log('✅ Vendor relation found:', latestLog.vendor);
      } else {
        console.log('❌ Vendor relation missing from log');
      }
    } else {
      console.log('❌ No logs found');
    }

    // Check vendor button clicks
    console.log('\n3. Checking vendor button clicks...');
    const vendorResponse = await axios.get(`${STRAPI_URL}/api/vendors/4?populate=*`);
    
    if (vendorResponse.data.data) {
      const vendor = vendorResponse.data.data;
      console.log('✅ Vendor button clicks:', vendor.buttonClicks);
    }

    console.log('\n🎉 DETAILED TRACKING TEST COMPLETED');
    console.log('==================================');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDetailedTracking(); 