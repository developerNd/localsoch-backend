const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

async function testDashboardIntegration() {
  try {
    console.log('🧪 Testing Dashboard Integration...\n');

    // 1. Get vendors
    console.log('1. Getting vendors...');
    const vendorsResponse = await axios.get(`${STRAPI_URL}/api/vendors`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    console.log(`✅ Found ${vendorsResponse.data.data.length} vendors`);
    
    const vendor = vendorsResponse.data.data[0];
    console.log(`📋 Testing with vendor: ${vendor.name} (ID: ${vendor.id})\n`);

    // 2. Test vendor with buttons endpoint
    console.log('2. Testing vendor with buttons endpoint...');
    try {
      const vendorWithButtonsResponse = await axios.get(`${STRAPI_URL}/api/vendors/${vendor.id}/with-buttons`, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      });
      console.log('✅ Vendor with buttons endpoint working');
      console.log('📊 Button config:', vendorWithButtonsResponse.data.data?.buttonConfig ? 'Present' : 'Not found');
      console.log('📊 Button clicks:', vendorWithButtonsResponse.data.data?.buttonClicks ? 'Present' : 'Not found');
      console.log('📊 Profile image:', vendorWithButtonsResponse.data.data?.profileImage ? 'Present' : 'Not found');
    } catch (error) {
      console.log('❌ Vendor with buttons endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // 3. Test button analytics endpoint
    console.log('\n3. Testing button analytics endpoint...');
    try {
      const analyticsResponse = await axios.get(`${STRAPI_URL}/api/vendors/${vendor.id}/button-analytics`, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      });
      console.log('✅ Button analytics endpoint working');
      console.log('📈 Analytics data:', analyticsResponse.data.data);
    } catch (error) {
      console.log('❌ Button analytics endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // 4. Simulate some button clicks
    console.log('\n4. Simulating button clicks...');
    const buttonTypes = ['message', 'call', 'whatsapp', 'email', 'website'];
    
    for (const buttonType of buttonTypes) {
      try {
        await axios.post(`${STRAPI_URL}/api/vendors/track-button-click`, {
          vendorId: vendor.id,
          buttonType
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ Tracked ${buttonType} button click`);
      } catch (error) {
        console.log(`❌ Failed to track ${buttonType} button click:`, error.response?.data?.error?.message || error.message);
      }
    }

    // 5. Check updated analytics
    console.log('\n5. Checking updated analytics...');
    try {
      const updatedAnalyticsResponse = await axios.get(`${STRAPI_URL}/api/vendors/${vendor.id}/button-analytics`, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      });
      console.log('✅ Updated analytics retrieved');
      console.log('📈 Updated analytics:', updatedAnalyticsResponse.data.data);
    } catch (error) {
      console.log('❌ Failed to get updated analytics:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Dashboard integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Wait for server to start
setTimeout(testDashboardIntegration, 5000); 