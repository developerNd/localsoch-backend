// Test script to verify notification creation directly
const strapi = require('@strapi/strapi');

async function testNotificationCreation() {
  try {
    console.log('🧪 Testing notification creation directly...\n');

    // Initialize Strapi
    await strapi().load();

    // Test notification data
    const notificationData = {
      title: 'Test Notification',
      message: 'This is a test notification created directly via entityService.',
      type: 'info',
      user: 1, // Replace with actual user ID
      isRead: false,
      isImportant: false
    };

    console.log('🔔 Creating notification with data:', notificationData);

    // Create notification directly using entityService
    const notification = await strapi.entityService.create('api::notification.notification', {
      data: notificationData,
      populate: ['user']
    });

    console.log('✅ Notification created successfully!');
    console.log('Notification ID:', notification.id);
    console.log('Notification data:', notification);

    // Test fetching the notification
    console.log('\n🔍 Fetching created notification...');
    const fetchedNotification = await strapi.entityService.findOne('api::notification.notification', notification.id, {
      populate: ['user']
    });

    console.log('✅ Notification fetched successfully:', fetchedNotification);

    // Test fetching notifications for user
    console.log('\n🔍 Fetching notifications for user...');
    const userNotifications = await strapi.entityService.findMany('api::notification.notification', {
      filters: { user: 1 },
      populate: ['user'],
      sort: { createdAt: 'desc' }
    });

    console.log('✅ User notifications:', userNotifications);

    console.log('\n🎉 All tests passed! Notification system is working.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    // Destroy Strapi instance
    await strapi().destroy();
  }
}

// Run the test
testNotificationCreation(); 