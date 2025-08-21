const axios = require('axios');

const API_URL = 'http://192.168.1.102:1337';

async function testAdminNotifications() {
  console.log('🧪 Testing Admin Notification System...\n');

  try {
    // 1. Test authentication with admin user
    console.log('1. Testing admin authentication...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin123'
    });

    if (!loginResponse.data.jwt) {
      console.log('❌ Admin authentication failed, trying to create admin user...');
      
      // Create admin user if authentication fails
      const createAdminResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 3 // admin role
      });

      if (createAdminResponse.data.jwt) {
        console.log('✅ Admin user created and authenticated');
        const token = createAdminResponse.data.jwt;
      } else {
        throw new Error('Failed to create admin user');
      }
    } else {
      console.log('✅ Admin authentication successful');
      const token = loginResponse.data.jwt;
    }

    // 2. Test fetching users and vendors
    console.log('\n2. Testing user and vendor fetching...');
    const headers = { Authorization: `Bearer ${token}` };

    const usersResponse = await axios.get(`${API_URL}/api/users?populate=*`, { headers });
    const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`, { headers });

    console.log(`✅ Found ${usersResponse.data.length} users`);
    console.log(`✅ Found ${vendorsResponse.data.length} vendors`);

    // 3. Test single notification creation
    console.log('\n3. Testing single notification creation...');
    const singleNotification = {
      title: 'Test Notification',
      message: 'This is a test notification from admin',
      type: 'info',
      isImportant: false,
      isAdminCreated: true,
      user: usersResponse.data[0]?.id || null,
      vendor: vendorsResponse.data[0]?.id || null
    };

    const singleResponse = await axios.post(`${API_URL}/api/notifications`, {
      data: singleNotification
    }, { headers });

    console.log('✅ Single notification created successfully');

    // 4. Test bulk notification creation
    console.log('\n4. Testing bulk notification creation...');
    const bulkNotifications = [];

    // Add notifications for all users
    usersResponse.data.forEach(user => {
      bulkNotifications.push({
        title: 'Bulk Test Notification',
        message: 'This is a bulk test notification for users',
        type: 'info',
        isImportant: false,
        isAdminCreated: true,
        user: user.id
      });
    });

    // Add notifications for all vendors
    vendorsResponse.data.forEach(vendor => {
      bulkNotifications.push({
        title: 'Bulk Test Notification',
        message: 'This is a bulk test notification for vendors',
        type: 'info',
        isImportant: false,
        isAdminCreated: true,
        vendor: vendor.id
      });
    });

    const bulkResponse = await axios.post(`${API_URL}/api/notifications/bulk`, {
      notifications: bulkNotifications
    }, { headers });

    console.log(`✅ Bulk notifications created successfully: ${bulkResponse.data.data.length} notifications`);

    // 5. Test fetching admin-created notifications
    console.log('\n5. Testing admin notification fetching...');
    const adminNotificationsResponse = await axios.get(
      `${API_URL}/api/notifications?populate=*&sort=createdAt:desc&filters%5BisAdminCreated%5D%5B%24eq%5D=true`,
      { headers }
    );

    console.log(`✅ Found ${adminNotificationsResponse.data.data.length} admin-created notifications`);

    // 6. Test notification statistics
    console.log('\n6. Testing notification statistics...');
    const totalNotifications = adminNotificationsResponse.data.data.length;
    const unreadNotifications = adminNotificationsResponse.data.data.filter(n => !n.isRead).length;
    const importantNotifications = adminNotificationsResponse.data.data.filter(n => n.isImportant).length;

    console.log(`📊 Total notifications: ${totalNotifications}`);
    console.log(`📊 Unread notifications: ${unreadNotifications}`);
    console.log(`📊 Important notifications: ${importantNotifications}`);

    console.log('\n🎉 Admin notification system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Authentication working');
    console.log('✅ User/Vendor fetching working');
    console.log('✅ Single notification creation working');
    console.log('✅ Bulk notification creation working');
    console.log('✅ Admin notification fetching working');
    console.log('✅ Notification statistics working');

  } catch (error) {
    console.error('❌ Error testing admin notifications:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n🔧 Troubleshooting 403 error:');
      console.log('1. Check if admin role has notification permissions');
      console.log('2. Verify authentication token is valid');
      console.log('3. Ensure admin user exists and is properly configured');
    }
  }
}

// Run the test
testAdminNotifications(); 