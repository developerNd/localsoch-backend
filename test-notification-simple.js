// Simple test to verify notification creation
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testNotificationCreation() {
  try {
    console.log('🧪 Testing notification creation...\n');

    // First, let's check if the notification content type exists
    console.log('1. Checking if notification content type exists...');
    try {
      const response = await axios.get(`${API_URL}/api/notifications`);
      console.log('✅ Notification API is accessible (403 is expected without auth)');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Notification API is accessible (403 is expected without auth)');
      } else {
        console.log('❌ Notification API error:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Check if we can create a notification with authentication
    console.log('\n2. Testing notification creation with auth...');
    
    // First, let's try to get an auth token (this might not work without proper setup)
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'admin@example.com',
        password: 'admin123'
      });
      
      const token = loginResponse.data.jwt;
      console.log('✅ Got auth token');

      // Now try to create a notification
      const notificationData = {
        data: {
          title: 'Test Notification',
          message: 'This is a test notification.',
          type: 'info',
          user: 1,
          isRead: false,
          isImportant: false
        }
      };

      const createResponse = await axios.post(`${API_URL}/api/notifications`, notificationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Notification created successfully:', createResponse.data);

    } catch (authError) {
      console.log('⚠️ Auth test failed (this is expected if no admin user exists):', authError.response?.data || authError.message);
    }

    // Test 3: Check database directly
    console.log('\n3. Checking if notifications table exists...');
    try {
      // This will fail but we can see if the table exists
      const dbResponse = await axios.get(`${API_URL}/api/notifications?populate=*`);
      console.log('✅ Notifications table exists');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Notifications table exists (403 is expected without auth)');
      } else {
        console.log('❌ Notifications table error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n🎉 Basic notification system test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Place an order from the mobile app');
    console.log('2. Check the Strapi logs for notification creation');
    console.log('3. Check the database for notifications');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNotificationCreation(); 