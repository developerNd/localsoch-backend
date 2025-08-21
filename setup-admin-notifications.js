const axios = require('axios');

const API_URL = 'http://192.168.1.102:1337';

async function setupAdminNotifications() {
  console.log('🔧 Setting up Admin Notification System...\n');

  try {
    // 1. Create admin user
    console.log('1. Creating admin user...');
    const createAdminResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: 'admin_notifications',
      email: 'admin_notifications@example.com',
      password: 'admin123456',
      role: 3 // admin role
    });

    if (createAdminResponse.data.jwt) {
      console.log('✅ Admin user created successfully');
      const token = createAdminResponse.data.jwt;
      const headers = { Authorization: `Bearer ${token}` };

      // 2. Test fetching users and vendors
      console.log('\n2. Testing user and vendor fetching...');
      const usersResponse = await axios.get(`${API_URL}/api/users?populate=*`, { headers });
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`, { headers });

      console.log(`✅ Found ${usersResponse.data.length} users`);
      console.log(`✅ Found ${vendorsResponse.data.length} vendors`);

      // 3. Test bulk notification creation
      console.log('\n3. Testing bulk notification creation...');
      const bulkNotifications = [];

      // Add notifications for all users
      usersResponse.data.forEach(user => {
        bulkNotifications.push({
          title: 'Welcome Notification',
          message: 'Welcome to our platform! We hope you enjoy your experience.',
          type: 'info',
          isImportant: false,
          isAdminCreated: true,
          user: user.id
        });
      });

      // Add notifications for all vendors
      vendorsResponse.data.forEach(vendor => {
        bulkNotifications.push({
          title: 'Seller Welcome',
          message: 'Welcome to our seller community! Your shop is now live.',
          type: 'success',
          isImportant: true,
          isAdminCreated: true,
          vendor: vendor.id
        });
      });

      if (bulkNotifications.length > 0) {
        const bulkResponse = await axios.post(`${API_URL}/api/notifications/bulk`, {
          notifications: bulkNotifications
        }, { headers });

        console.log(`✅ Bulk notifications created successfully: ${bulkResponse.data.data.length} notifications`);
      } else {
        console.log('⚠️ No users or vendors found to send notifications to');
      }

      // 4. Test fetching admin-created notifications
      console.log('\n4. Testing admin notification fetching...');
      const adminNotificationsResponse = await axios.get(
        `${API_URL}/api/notifications?populate=*&sort=createdAt:desc&filters%5BisAdminCreated%5D%5B%24eq%5D=true`,
        { headers }
      );

      console.log(`✅ Found ${adminNotificationsResponse.data.data.length} admin-created notifications`);

      // 5. Display notification statistics
      console.log('\n5. Notification Statistics:');
      const totalNotifications = adminNotificationsResponse.data.data.length;
      const unreadNotifications = adminNotificationsResponse.data.data.filter(n => !n.isRead).length;
      const importantNotifications = adminNotificationsResponse.data.data.filter(n => n.isImportant).length;

      console.log(`📊 Total notifications: ${totalNotifications}`);
      console.log(`📊 Unread notifications: ${unreadNotifications}`);
      console.log(`📊 Important notifications: ${importantNotifications}`);

      console.log('\n🎉 Admin notification system setup completed successfully!');
      console.log('\n📋 Admin Credentials:');
      console.log('Email: admin_notifications@example.com');
      console.log('Password: admin123456');
      console.log('\n📋 Summary:');
      console.log('✅ Admin user created');
      console.log('✅ User/Vendor fetching working');
      console.log('✅ Bulk notification creation working');
      console.log('✅ Admin notification fetching working');
      console.log('✅ Notification statistics working');

    } else {
      throw new Error('Failed to create admin user');
    }

  } catch (error) {
    console.error('❌ Error setting up admin notifications:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n🔧 Troubleshooting 403 error:');
      console.log('1. Check if admin role has notification permissions');
      console.log('2. Verify authentication token is valid');
      console.log('3. Ensure admin user exists and is properly configured');
    }
  }
}

// Run the setup
setupAdminNotifications(); 