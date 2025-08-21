const axios = require('axios');

const API_BASE = 'http://localhost:1337';

async function testPushNotification() {
  try {
    console.log('🧪 Testing push notification system...\n');

    // Step 1: Get all users to find one with FCM token
    console.log('1️⃣ Getting users with FCM tokens...');
    const usersResponse = await axios.get(`${API_BASE}/api/users?populate=*`);
    const users = usersResponse.data;
    console.log(`✅ Found ${users.length} users`);

    const userWithToken = users.find(user => user.fcmToken);
    if (!userWithToken) {
      console.log('❌ No users found with FCM tokens. Please run the app first to register tokens.');
      return;
    }

    console.log(`📱 Using user: ${userWithToken.username} (ID: ${userWithToken.id})`);
    console.log(`🔔 FCM Token: ${userWithToken.fcmToken}`);

    // Step 2: Create a test notification
    console.log('\n2️⃣ Creating test notification...');
    const notificationData = {
      data: {
        title: 'Test Push Notification',
        message: 'This is a test push notification from the backend!',
        type: 'test',
        isRead: false,
        isImportant: false,
        isAdminCreated: true,
        user: userWithToken.id,
        vendor: null
      }
    };

    const createResponse = await axios.post(`${API_BASE}/api/notifications`, notificationData);
    console.log('✅ Test notification created:', createResponse.data.id);

    // Step 3: Test direct FCM send (if Firebase Admin SDK is configured)
    console.log('\n3️⃣ Testing direct FCM send...');
    try {
      const fcmResponse = await axios.post(`${API_BASE}/api/notifications/test-push`, {
        token: userWithToken.fcmToken,
        title: 'Direct FCM Test',
        message: 'This is a direct FCM test notification!',
        type: 'test'
      });
      console.log('✅ Direct FCM test sent');
    } catch (error) {
      console.log('⚠️ Direct FCM test failed (Firebase Admin SDK not configured):', error.message);
    }

    console.log('\n🎉 Push notification test completed!');
    console.log('\n📱 Next steps:');
    console.log('1. Check if notification appears in the mobile app');
    console.log('2. Verify notification count badge updates');
    console.log('3. Test notification tap behavior');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPushNotification(); 