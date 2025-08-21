// Manual test script to verify notification system
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testNotificationSystem() {
  try {
    console.log('🧪 Manual Notification System Test...\n');

    // Test 1: Check if notifications endpoint is working
    console.log('1️⃣ Testing Notifications Endpoint...');
    try {
      const response = await axios.get(`${API_URL}/api/notifications?populate=*`);
      console.log('✅ Notifications endpoint working');
      console.log('📊 Current notifications:', response.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Notifications endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 2: Create a test notification
    console.log('\n2️⃣ Creating Test Notification...');
    try {
      const testNotification = await axios.post(`${API_URL}/api/notifications`, {
        data: {
          title: 'Test Notification',
          message: 'This is a manual test notification',
          type: 'info',
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        }
      });
      console.log('✅ Test notification created successfully');
      console.log('📝 Notification ID:', testNotification.data.data.id);
    } catch (error) {
      console.log('❌ Test notification creation failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 3: Check users and roles
    console.log('\n3️⃣ Checking Users and Roles...');
    try {
      const usersResponse = await axios.get(`${API_URL}/api/users?populate=*`);
      console.log('✅ Users endpoint working');
      console.log('📊 Total users:', usersResponse.data.length || 0);
      
      if (usersResponse.data && usersResponse.data.length > 0) {
        const adminUsers = usersResponse.data.filter(user => user.role?.name === 'admin');
        console.log('👑 Admin users found:', adminUsers.length);
        adminUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.username || user.email}`);
        });
      }
    } catch (error) {
      console.log('❌ Users endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Manual Test Complete!');
    console.log('\n📋 To test the full notification system:');
    console.log('1. Create a new product as a seller');
    console.log('2. Check admin dashboard for "New Product Created" notification');
    console.log('3. Approve/reject the product as admin');
    console.log('4. Check seller dashboard for product status notification');
    console.log('\n🔍 Check the Strapi logs for notification creation messages');

  } catch (error) {
    console.error('❌ Manual test failed:', error);
  }
}

// Run the manual test
testNotificationSystem(); 