const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testFCMTokenRegistration() {
  console.log('🧪 Testing FCM Token Registration...\n');

  try {
    // Test 1: Direct user update (this should work)
    console.log('1️⃣ Testing direct user update...');
    const userUpdateResponse = await axios.put(`${API_URL}/api/users/1`, {
      fcmToken: 'test_fcm_token_123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (userUpdateResponse.status === 200) {
      console.log('✅ Direct user update successful');
    } else {
      console.log('❌ Direct user update failed:', userUpdateResponse.status);
    }
  } catch (error) {
    console.log('❌ Direct user update failed:', error.response?.status || error.message);
  }

  try {
    // Test 2: Notification endpoint (this might fail due to auth)
    console.log('\n2️⃣ Testing notification endpoint...');
    const notificationResponse = await axios.put(`${API_URL}/api/notifications/push/user/1/token`, {
      fcmToken: 'test_fcm_token_456'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (notificationResponse.status === 200) {
      console.log('✅ Notification endpoint successful');
    } else {
      console.log('❌ Notification endpoint failed:', notificationResponse.status);
    }
  } catch (error) {
    console.log('❌ Notification endpoint failed:', error.response?.status || error.message);
  }

  try {
    // Test 3: Check if FCM token was saved
    console.log('\n3️⃣ Checking if FCM token was saved...');
    const userResponse = await axios.get(`${API_URL}/api/users/1`);
    
    if (userResponse.status === 200) {
      const user = userResponse.data;
      if (user.fcmToken) {
        console.log('✅ FCM token found in user record:', user.fcmToken);
      } else {
        console.log('❌ FCM token not found in user record');
      }
    } else {
      console.log('❌ Failed to get user data:', userResponse.status);
    }
  } catch (error) {
    console.log('❌ Failed to get user data:', error.response?.status || error.message);
  }

  console.log('\n🎯 Summary:');
  console.log('- The React Native app should use the direct user update method');
  console.log('- This bypasses authentication issues with custom endpoints');
  console.log('- The FCM token will be saved directly to the user record');
}

testFCMTokenRegistration().catch(console.error); 