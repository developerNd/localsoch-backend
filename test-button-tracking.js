const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

async function testButtonTracking() {
  try {
    console.log('Testing button tracking functionality...\n');

    // 1. Get vendors
    console.log('1. Getting vendors...');
    const vendorsResponse = await axios.get(`${STRAPI_URL}/api/vendors`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    console.log(`Found ${vendorsResponse.data.data.length} vendors`);
    
    const vendor = vendorsResponse.data.data[0];
    console.log(`Testing with vendor: ${vendor.name} (ID: ${vendor.id})\n`);

    // 2. Test button click tracking
    console.log('2. Testing button click tracking...');
    const trackResponse = await axios.post(`${STRAPI_URL}/api/vendors/track-button-click`, {
      vendorId: vendor.id,
      buttonType: 'message'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Button click tracked successfully');
    console.log('Response:', trackResponse.data);

    // 3. Test getting button analytics
    console.log('\n3. Testing button analytics...');
    const analyticsResponse = await axios.get(`${STRAPI_URL}/api/vendors/${vendor.id}/button-analytics`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    console.log('✅ Button analytics retrieved successfully');
    console.log('Analytics:', analyticsResponse.data);

    // 4. Test getting vendor with buttons
    console.log('\n4. Testing vendor with buttons...');
    const vendorWithButtonsResponse = await axios.get(`${STRAPI_URL}/api/vendors/${vendor.id}/with-buttons`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    console.log('✅ Vendor with buttons retrieved successfully');
    console.log('Vendor data:', JSON.stringify(vendorWithButtonsResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Wait for server to start
setTimeout(testButtonTracking, 10000); 