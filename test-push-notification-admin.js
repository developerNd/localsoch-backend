const axios = require('axios');

const API_BASE = 'http://localhost:1337';

async function testAdminPushNotifications() {
  try {
    console.log('🧪 Testing Admin Push Notification System...\n');

    // Step 1: Get notification statistics
    console.log('1️⃣ Getting push notification statistics...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/api/notifications/push/stats`);
      const stats = statsResponse.data.data;
      console.log('✅ Push notification stats:', stats);
    } catch (error) {
      console.log('❌ Failed to get push notification stats:', error.message);
    }

    // Step 2: Get users and vendors
    console.log('\n2️⃣ Getting users and vendors...');
    const usersResponse = await axios.get(`${API_BASE}/api/users?populate=*`);
    const users = usersResponse.data;
    const vendorsResponse = await axios.get(`${API_BASE}/api/vendors?populate=*`);
    const vendors = vendorsResponse.data;
    
    console.log(`✅ Found ${users.length} users and ${vendors.length} vendors`);

    // Step 3: Test push notification to specific users
    console.log('\n3️⃣ Testing push notification to specific users...');
    const usersWithTokens = users.filter(user => user.fcmToken);
    if (usersWithTokens.length > 0) {
      const testUserIds = usersWithTokens.slice(0, 2).map(user => user.id);
      console.log(`📱 Testing with ${testUserIds.length} users:`, testUserIds);
      
      try {
        const pushResponse = await axios.post(`${API_BASE}/api/notifications/push/users`, {
          userIds: testUserIds,
          notification: {
            title: 'Admin Test Push Notification',
            message: 'This is a test push notification from the admin panel!',
            type: 'info'
          },
          data: {
            type: 'info',
            isImportant: 'false',
            isAdminCreated: 'true'
          }
        });
        console.log('✅ Push notification to users sent:', pushResponse.data);
      } catch (error) {
        console.log('❌ Failed to send push notification to users:', error.response?.data || error.message);
      }
    } else {
      console.log('⚠️ No users found with FCM tokens');
    }

    // Step 4: Test push notification to specific vendors
    console.log('\n4️⃣ Testing push notification to specific vendors...');
    const vendorsWithTokens = vendors.filter(vendor => vendor.fcmToken);
    if (vendorsWithTokens.length > 0) {
      const testVendorIds = vendorsWithTokens.slice(0, 2).map(vendor => vendor.id);
      console.log(`📱 Testing with ${testVendorIds.length} vendors:`, testVendorIds);
      
      try {
        const pushResponse = await axios.post(`${API_BASE}/api/notifications/push/vendors`, {
          vendorIds: testVendorIds,
          notification: {
            title: 'Admin Test Push Notification',
            message: 'This is a test push notification for vendors from the admin panel!',
            type: 'info'
          },
          data: {
            type: 'info',
            isImportant: 'false',
            isAdminCreated: 'true'
          }
        });
        console.log('✅ Push notification to vendors sent:', pushResponse.data);
      } catch (error) {
        console.log('❌ Failed to send push notification to vendors:', error.response?.data || error.message);
      }
    } else {
      console.log('⚠️ No vendors found with FCM tokens');
    }

    // Step 5: Test push notification to all users
    console.log('\n5️⃣ Testing push notification to all users...');
    try {
      const pushResponse = await axios.post(`${API_BASE}/api/notifications/push/all-users`, {
        notification: {
          title: 'Admin Broadcast to All Users',
          message: 'This is a broadcast push notification to all users from the admin panel!',
          type: 'system'
        },
        data: {
          type: 'system',
          isImportant: 'true',
          isAdminCreated: 'true'
        }
      });
      console.log('✅ Push notification to all users sent:', pushResponse.data);
    } catch (error) {
      console.log('❌ Failed to send push notification to all users:', error.response?.data || error.message);
    }

    // Step 6: Test push notification to all vendors
    console.log('\n6️⃣ Testing push notification to all vendors...');
    try {
      const pushResponse = await axios.post(`${API_BASE}/api/notifications/push/all-vendors`, {
        notification: {
          title: 'Admin Broadcast to All Vendors',
          message: 'This is a broadcast push notification to all vendors from the admin panel!',
          type: 'system'
        },
        data: {
          type: 'system',
          isImportant: 'true',
          isAdminCreated: 'true'
        }
      });
      console.log('✅ Push notification to all vendors sent:', pushResponse.data);
    } catch (error) {
      console.log('❌ Failed to send push notification to all vendors:', error.response?.data || error.message);
    }

    // Step 7: Test push notification to everyone
    console.log('\n7️⃣ Testing push notification to everyone...');
    try {
      const pushResponse = await axios.post(`${API_BASE}/api/notifications/push/everyone`, {
        notification: {
          title: 'Admin Broadcast to Everyone',
          message: 'This is a broadcast push notification to everyone from the admin panel!',
          type: 'system'
        },
        data: {
          type: 'system',
          isImportant: 'true',
          isAdminCreated: 'true'
        }
      });
      console.log('✅ Push notification to everyone sent:', pushResponse.data);
    } catch (error) {
      console.log('❌ Failed to send push notification to everyone:', error.response?.data || error.message);
    }

    console.log('\n🎉 Admin push notification test completed!');
    console.log('\n📱 Next steps:');
    console.log('1. Check if push notifications appear on mobile devices');
    console.log('2. Verify notification count badges update');
    console.log('3. Test notification tap behavior');
    console.log('4. Check admin panel for notification statistics');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminPushNotifications(); 