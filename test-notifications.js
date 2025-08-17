const axios = require('axios');

const API_URL = 'http://localhost:1337';

// Test notification creation
async function testNotifications() {
  try {
    console.log('🧪 Testing notification system...\n');

    // Test 1: Create a test notification
    console.log('1. Creating test notification...');
    const notificationData = {
      data: {
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        type: 'info',
        user: 1, // Replace with actual user ID
        isImportant: false
      }
    };

    const response = await axios.post(`${API_URL}/api/notifications`, notificationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Test notification created:', response.data);
    console.log('Notification ID:', response.data.data.id);

    // Test 2: Get notifications for user
    console.log('\n2. Fetching notifications for user...');
    const notificationsResponse = await axios.get(`${API_URL}/api/notifications/user/1`);
    console.log('✅ Notifications fetched:', notificationsResponse.data);

    // Test 3: Get unread count
    console.log('\n3. Getting unread count...');
    const unreadResponse = await axios.get(`${API_URL}/api/notifications/user/1/unread-count`);
    console.log('✅ Unread count:', unreadResponse.data);

    // Test 4: Mark notification as read
    console.log('\n4. Marking notification as read...');
    const markReadResponse = await axios.put(`${API_URL}/api/notifications/${response.data.data.id}/read`);
    console.log('✅ Notification marked as read:', markReadResponse.data);

    console.log('\n🎉 All notification tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testNotifications(); 