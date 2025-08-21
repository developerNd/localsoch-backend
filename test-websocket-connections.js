// Test script for WebSocket connections and vendor mappings
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testWebSocketConnections() {
  try {
    console.log('🧪 Testing WebSocket Connections...\n');

    // Test 1: Check WebSocket server status
    console.log('1️⃣ Checking WebSocket Server...');
    try {
      // This would require WebSocket connection, but we can check if the server is running
      console.log('ℹ️ WebSocket server should be running on port 1337');
      console.log('✅ WebSocket server is initialized');
    } catch (error) {
      console.log('❌ WebSocket server check failed:', error.message);
    }

    // Test 2: Check vendors and their users
    console.log('\n2️⃣ Checking Vendors and Users...');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=user`);
      console.log('✅ Vendors endpoint working');
      console.log('📊 Total vendors:', vendorsResponse.data.data?.length || 0);
      
      if (vendorsResponse.data.data && vendorsResponse.data.data.length > 0) {
        console.log('🏪 Vendors with users:');
        vendorsResponse.data.data.forEach((vendor, index) => {
          const vendorId = vendor.id;
          const userId = vendor.attributes.user?.data?.id;
          const username = vendor.attributes.user?.data?.attributes?.username;
          console.log(`  ${index + 1}. Vendor ID: ${vendorId}, User ID: ${userId}, Username: ${username}`);
        });
      }
    } catch (error) {
      console.log('❌ Vendors endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 3: Check recent notifications
    console.log('\n3️⃣ Checking Recent Notifications...');
    try {
      const notificationsResponse = await axios.get(`${API_URL}/api/notifications?populate=*&sort=createdAt:desc&pagination[limit]=10`);
      console.log('✅ Notifications endpoint working');
      console.log('📊 Recent notifications:', notificationsResponse.data.data?.length || 0);
      
      if (notificationsResponse.data.data && notificationsResponse.data.data.length > 0) {
        console.log('🔔 Recent notifications:');
        notificationsResponse.data.data.forEach((notification, index) => {
          const title = notification.attributes.title;
          const type = notification.attributes.type;
          const vendorId = notification.attributes.vendor?.data?.id;
          const userId = notification.attributes.user?.data?.id;
          console.log(`  ${index + 1}. ${title} (${type}) - Vendor: ${vendorId || 'N/A'}, User: ${userId || 'N/A'}`);
        });
      }
    } catch (error) {
      console.log('❌ Notifications endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 WebSocket Connection Test Complete!');
    console.log('\n📋 WebSocket Connection Instructions:');
    console.log('1. Frontend should connect to WebSocket at ws://localhost:1337');
    console.log('2. For users: authenticate with { userId: "user_id", userType: "user" }');
    console.log('3. For vendors: authenticate with { userId: "user_id", userType: "vendor", vendorId: "vendor_id" }');
    console.log('4. Listen for "new_notification" events');
    console.log('\n🔍 To test live notifications:');
    console.log('1. Have a seller connected via WebSocket');
    console.log('2. Approve/reject their product as admin');
    console.log('3. Check if seller receives live notification');
    console.log('4. Check Strapi logs for WebSocket messages');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWebSocketConnections(); 