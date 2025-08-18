const axios = require('axios');

const STRAPI_URL = 'https://api.localsoch.com';

// Test component creation directly
async function testComponentCreation() {
  try {
    console.log('🔍 TESTING COMPONENT CREATION');
    console.log('=============================\n');

    // Test creating a button click log with components directly
    console.log('1. Testing direct component creation...');
    
    const directCreationResponse = await axios.post(`${STRAPI_URL}/api/button-click-logs`, {
      data: {
        buttonType: 'call',
        ipAddress: '192.168.1.1',
        userAgent: 'Test User Agent',
        clickedAt: new Date().toISOString(),
        userInfo: {
          name: 'Test User Direct',
          phone: '+91 98765 43210',
          email: 'test.direct@example.com',
          userId: '123',
          isGuest: false
        },
        deviceInfo: {
          platform: 'android',
          appVersion: '1.0.0',
          deviceModel: 'Test Device',
          osVersion: 'Test OS'
        },
        vendor: 4
      }
    });

    console.log('✅ Direct creation response:', directCreationResponse.data);

    // Check the created log
    if (directCreationResponse.data.data) {
      const createdLog = directCreationResponse.data.data;
      console.log('✅ Created log entry:', createdLog);
      
      if (createdLog.userInfo) {
        console.log('✅ User info found:', createdLog.userInfo);
      } else {
        console.log('❌ User info missing from direct creation');
      }
      
      if (createdLog.deviceInfo) {
        console.log('✅ Device info found:', createdLog.deviceInfo);
      } else {
        console.log('❌ Device info missing from direct creation');
      }
      
      if (createdLog.vendor) {
        console.log('✅ Vendor relation found:', createdLog.vendor);
      } else {
        console.log('❌ Vendor relation missing from direct creation');
      }
    }

    // Test with different component structure
    console.log('\n2. Testing with different component structure...');
    
    const alternativeCreationResponse = await axios.post(`${STRAPI_URL}/api/button-click-logs`, {
      data: {
        buttonType: 'whatsapp',
        ipAddress: '192.168.1.2',
        userAgent: 'Test User Agent 2',
        clickedAt: new Date().toISOString(),
        userInfo: {
          __component: 'user.user-info',
          name: 'Test User Alternative',
          phone: '+91 98765 43211',
          email: 'test.alternative@example.com',
          userId: '124',
          isGuest: false
        },
        deviceInfo: {
          __component: 'device.device-info',
          platform: 'ios',
          appVersion: '1.0.1',
          deviceModel: 'Test Device 2',
          osVersion: 'Test OS 2'
        },
        vendor: 4
      }
    });

    console.log('✅ Alternative creation response:', alternativeCreationResponse.data);

    // Check the alternative created log
    if (alternativeCreationResponse.data.data) {
      const altCreatedLog = alternativeCreationResponse.data.data;
      console.log('✅ Alternative created log entry:', altCreatedLog);
      
      if (altCreatedLog.userInfo) {
        console.log('✅ User info found in alternative:', altCreatedLog.userInfo);
      } else {
        console.log('❌ User info missing from alternative creation');
      }
      
      if (altCreatedLog.deviceInfo) {
        console.log('✅ Device info found in alternative:', altCreatedLog.deviceInfo);
      } else {
        console.log('❌ Device info missing from alternative creation');
      }
      
      if (altCreatedLog.vendor) {
        console.log('✅ Vendor relation found in alternative:', altCreatedLog.vendor);
      } else {
        console.log('❌ Vendor relation missing from alternative creation');
      }
    }

    console.log('\n🎉 COMPONENT CREATION TEST COMPLETED');
    console.log('===================================');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testComponentCreation(); 