const axios = require('axios');

const API_BASE = 'http://localhost:1337';

async function testNotificationApp() {
  try {
    console.log('🧪 Testing notification system for mobile app...\n');

    // Step 1: Get all users to find a test user
    console.log('1️⃣ Getting all users...');
    const usersResponse = await axios.get(`${API_BASE}/api/users?populate=*`);
    const users = usersResponse.data;
    console.log(`✅ Found ${users.length} users`);

    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    // Use the first user for testing
    const testUser = users[0];
    console.log(`📱 Using test user: ${testUser.username} (ID: ${testUser.id})`);

    // Step 2: Create a test notification for the user
    console.log('\n2️⃣ Creating test notification...');
    const notificationData = {
      data: {
        title: 'Test Notification from App',
        message: 'This is a test notification to verify the mobile app notification system is working!',
        type: 'test',
        isRead: false,
        isImportant: false,
        isAdminCreated: true,
        user: testUser.id,
        vendor: null
      }
    };

    const createResponse = await axios.post(`${API_BASE}/api/notifications`, notificationData);
    console.log('✅ Test notification created:', createResponse.data.id);

    // Step 3: Verify the notification was created
    console.log('\n3️⃣ Verifying notification was created...');
    const verifyResponse = await axios.get(`${API_BASE}/api/notifications/user/${testUser.id}?populate=*`);
    const userNotifications = verifyResponse.data.data || [];
    console.log(`✅ User has ${userNotifications.length} notifications`);

    // Step 4: Check unread count
    console.log('\n4️⃣ Checking unread count...');
    const unreadResponse = await axios.get(`${API_BASE}/api/notifications?filters[user][id][$eq]=${testUser.id}&filters[isRead][$eq]=false&populate=*`);
    const unreadCount = unreadResponse.data.data?.length || 0;
    console.log(`✅ Unread notifications: ${unreadCount}`);

    // Step 5: Test WebSocket status
    console.log('\n5️⃣ Testing WebSocket status...');
    try {
      const wsStatusResponse = await axios.get(`${API_BASE}/api/websocket/status`);
      console.log('✅ WebSocket status:', wsStatusResponse.data);
    } catch (error) {
      console.log('⚠️ WebSocket status check failed:', error.message);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📱 Next steps:');
    console.log('1. Open the mobile app');
    console.log('2. Check if the notification count badge shows 1');
    console.log('3. Navigate to Notifications screen');
    console.log('4. Verify the test notification appears');
    console.log('5. Send another notification from admin panel to test real-time updates');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNotificationApp(); 