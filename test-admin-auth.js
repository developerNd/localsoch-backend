const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testAdminAuth() {
  console.log('🧪 Testing Admin Authentication and Push Notifications...\n');

  // Try different admin credentials
  const adminCredentials = [
    { identifier: 'admin@gmail.com', password: 'Admin@123' },
    { identifier: 'admin@gmail.com', password: 'admin' },
    { identifier: 'admin@gmail.com', password: 'password' },
    { identifier: 'admin@gmail.com', password: '123456' },
    { identifier: 'admin@gmail.com', password: 'admin@gmail.com' }
  ];

  let jwt = null;
  let user = null;

  for (const creds of adminCredentials) {
    try {
      console.log(`🔐 Trying admin login with: ${creds.identifier} / ${creds.password}`);
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, creds);
      
      if (loginResponse.status === 200) {
        jwt = loginResponse.data.jwt;
        user = loginResponse.data.user;
        console.log('✅ Admin login successful');
        console.log('🔑 JWT token received');
        console.log('👤 Admin user:', user.username, 'Role:', user.role?.name);
        break;
      }
    } catch (error) {
      console.log(`❌ Failed with ${creds.password}:`, error.response?.status || error.message);
    }
  }

  if (!jwt) {
    console.log('\n❌ All admin login attempts failed');
    console.log('💡 You may need to reset the admin password or create a new admin user');
    return;
  }

  try {
    // Test push notification with admin token
    console.log('\n2️⃣ Testing push notification with admin token...');
    const pushResponse = await axios.post(`${API_URL}/api/notifications/push/users`, {
      notification: {
        title: 'Admin Test Notification',
        message: 'This is a test notification from admin'
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
  } catch (error) {
    console.error('❌ Push notification error:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📤 Error response:', error.response.data);
    }
  }
}

testAdminAuth().catch(console.error); 