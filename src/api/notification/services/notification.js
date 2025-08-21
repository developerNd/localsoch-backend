'use strict';

/**
 * notification service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::notification.notification', ({ strapi }) => ({
  // Create notification with WebSocket integration
  async createNotification(notificationData) {
    try {
      console.log('🔔 Creating notification with WebSocket integration:', notificationData);
      
      // Set default values
      const notificationDataWithDefaults = {
        isRead: false,
        isImportant: false,
        isAdminCreated: false,
        ...notificationData
      };
      
      console.log('🔔 Final notification data:', notificationDataWithDefaults);
      
      const notification = await strapi.entityService.create('api::notification.notification', {
        data: notificationDataWithDefaults,
        populate: ['user', 'vendor', 'order', 'product', 'review']
      });
      
      console.log('✅ Notification created successfully:', notification);
      console.log('✅ Notification isRead value:', notification.isRead);
      
      // Send real-time notification via WebSocket
      try {
        const { sendNotificationToUser, sendNotificationToVendor } = require('../../../websocket');
        
        // Determine who should receive the notification based on type and context
        if (notification.type === 'order') {
          // For order notifications, send to the customer (user), not the vendor
          if (notification.user) {
            sendNotificationToUser(notification.user.id, notification);
            console.log(`🔌 WebSocket: Order notification sent to user ${notification.user.id}`);
          }
        } else if (notification.type === 'product') {
          // For product notifications, send to the vendor
          if (notification.vendor) {
            sendNotificationToVendor(notification.vendor.id, notification);
            console.log(`🔌 WebSocket: Product notification sent to vendor ${notification.vendor.id}`);
          }
        } else {
          // For other notifications, send to both if both exist
          if (notification.user) {
            sendNotificationToUser(notification.user.id, notification);
          }
          
          if (notification.vendor) {
            sendNotificationToVendor(notification.vendor.id, notification);
          }
        }
        
        console.log('🔌 WebSocket: Real-time notification sent');
      } catch (websocketError) {
        console.error('❌ WebSocket error (non-critical):', websocketError);
      }
      
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  },

  // Helper function to create admin notifications
  async createAdminNotification(title, message, type = 'info', metadata = {}) {
    try {
      console.log('🔔 Creating admin notification:', { title, message, type, metadata });
      
      // Get all admin users dynamically
      let adminUsers = [];
      
      try {
        // First try by role name
        adminUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: {
            role: {
              name: 'admin'
            }
          },
          populate: ['role']
        });
        
        if (adminUsers.length === 0) {
          // If no users found by name, try to get all users and filter by role name
          const allUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
            populate: ['role']
          });
          
          adminUsers = allUsers.filter(user => user.role && user.role.name === 'admin');
        }
        
        // If still no admin users found, log a warning but continue
        if (adminUsers.length === 0) {
          console.warn('⚠️ No admin users found. Admin notifications will not be sent.');
        }
      } catch (error) {
        console.error('❌ Error finding admin users:', error);
        // Don't send admin notifications if we can't find admin users
        adminUsers = [];
      }

      console.log('🔍 Found admin users:', adminUsers.length);
      if (adminUsers.length > 0) {
        adminUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.username || user.email} (ID: ${user.id})`);
        });
      }

      // Create notifications for all admin users
      const notifications = [];
      for (const adminUser of adminUsers) {
        const notificationData = {
          title,
          message,
          type,
          user: adminUser.id,
          isAdminCreated: false,
          isImportant: type === 'warning' || type === 'error',
          metadata: {
            ...metadata,
            adminNotification: true
          }
        };

        const notification = await this.createNotification(notificationData);
        notifications.push(notification);
      }

      console.log('✅ Created admin notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('❌ Error creating admin notification:', error);
      throw error;
    }
  },

  // Helper function to create seller notifications
  async createSellerNotification(vendorId, title, message, type = 'info', metadata = {}) {
    try {
      console.log('🔔 Creating seller notification:', { vendorId, title, message, type, metadata });
      
      // Verify vendor exists
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', vendorId, {
        populate: ['user']
      });
      
      if (!vendor) {
        console.error('❌ Vendor not found with ID:', vendorId);
        throw new Error(`Vendor not found with ID: ${vendorId}`);
      }
      
      console.log('✅ Vendor found:', vendor.name || vendor.shopName, '(ID:', vendor.id, ')');
      
      const notificationData = {
        title,
        message,
        type,
        vendor: vendorId,
        isAdminCreated: false,
        isImportant: type === 'warning' || type === 'error',
        metadata: {
          ...metadata,
          sellerNotification: true
        }
      };

      console.log('🔔 Notification data prepared:', notificationData);
      
      const notification = await this.createNotification(notificationData);
      console.log('✅ Created seller notification:', notification.id);
      return notification;
    } catch (error) {
      console.error('❌ Error creating seller notification:', error);
      console.error('❌ Error details:', error.message);
      throw error;
    }
  }
})); 