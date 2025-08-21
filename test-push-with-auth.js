const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testPushWithAuth() {
  console.log('🧪 Testing Push Notifications with Authentication...\n');

  try {
    // First, let's try to login as admin
    console.log('1️⃣ Attempting to login as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200) {
      const { jwt } = loginResponse.data;
      console.log('✅ Admin login successful');
      console.log('🔑 JWT token received');
      
      // Test push notification with authentication
      console.log('\n2️⃣ Testing push notification with auth...');
      const pushResponse = await axios.post(`${API_URL}/api/notifications/push/users`, {
        notification: {
          title: 'Test Notification',
          message: 'This is a test notification'
        },
        userIds: [1]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });
      
      if (pushResponse.status === 200) {
        console.log('✅ Push notification sent successfully');
        console.log('📤 Response:', pushResponse.data);
      } else {
        console.log('❌ Push notification failed:', pushResponse.status);
        console.log('📤 Response:', pushResponse.data);
      }
    } else {
      console.log('❌ Admin login failed:', loginResponse.status);
      console.log('📤 Response:', loginResponse.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📤 Error response:', error.response.data);
    }
  }
}

testPushWithAuth().catch(console.error); 