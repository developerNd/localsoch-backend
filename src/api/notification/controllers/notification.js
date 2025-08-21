'use strict';

/**
 * notification controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const pushNotificationService = require('../../../services/pushNotificationService');

module.exports = createCoreController('api::notification.notification', ({ strapi }) => ({
  // Get notifications for a specific user
  async findForUser(ctx) {
    try {
      const { userId } = ctx.params;
      
      if (!userId) {
        return ctx.badRequest('User ID is required');
      }

      const notifications = await strapi.entityService.findMany('api::notification.notification', {
        filters: { user: userId },
        populate: ['order', 'product', 'review', 'vendor'],
        sort: { createdAt: 'desc' }
      });

      return { data: notifications };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return ctx.internalServerError('Failed to fetch notifications');
    }
  },

  // Get notifications for a specific vendor
  async findForVendor(ctx) {
    try {
      const { vendorId } = ctx.params;
      
      if (!vendorId) {
        return ctx.badRequest('Vendor ID is required');
      }

      const notifications = await strapi.entityService.findMany('api::notification.notification', {
        filters: { vendor: vendorId },
        populate: ['order', 'product', 'review', 'user'],
        sort: { createdAt: 'desc' }
      });

      return { data: notifications };
    } catch (error) {
      console.error('Error fetching vendor notifications:', error);
      return ctx.internalServerError('Failed to fetch notifications');
    }
  },

  // Mark notification as read
  async markAsRead(ctx) {
    try {
      const { id } = ctx.params;
      
      const notification = await strapi.entityService.update('api::notification.notification', id, {
        data: { isRead: true }
      });

      return { data: notification };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return ctx.internalServerError('Failed to mark notification as read');
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(ctx) {
    try {
      const { userId } = ctx.params;
      
      if (!userId) {
        return ctx.badRequest('User ID is required');
      }

      await strapi.db.query('api::notification.notification').updateMany({
        where: { user: userId, isRead: false },
        data: { isRead: true }
      });

      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return ctx.internalServerError('Failed to mark notifications as read');
    }
  },

  // Get unread count for a user
  async getUnreadCount(ctx) {
    try {
      const { userId } = ctx.params;
      
      console.log('🔍 Getting unread count for user:', userId);
      
      if (!userId) {
        return ctx.badRequest('User ID is required');
      }

      const count = await strapi.db.query('api::notification.notification').count({
        where: { user: userId, isRead: false }
      });

      console.log('✅ Unread count for user', userId, ':', count);
      return { count };
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return ctx.internalServerError('Failed to get unread count');
    }
  },

  // Get unread count for a vendor
  async getVendorUnreadCount(ctx) {
    try {
      const { vendorId } = ctx.params;
      
      console.log('🔍 Getting unread count for vendor:', vendorId);
      
      if (!vendorId) {
        return ctx.badRequest('Vendor ID is required');
      }

      const count = await strapi.db.query('api::notification.notification').count({
        where: { vendor: vendorId, isRead: false }
      });

      console.log('✅ Unread count for vendor', vendorId, ':', count);
      return { count };
    } catch (error) {
      console.error('❌ Error getting vendor unread count:', error);
      return ctx.internalServerError('Failed to get vendor unread count');
    }
  },

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
        const { sendNotificationToUser, sendNotificationToVendor } = require('../../websocket');
        
        if (notification.user) {
          sendNotificationToUser(notification.user.id, notification);
        }
        
        if (notification.vendor) {
          sendNotificationToVendor(notification.vendor.id, notification);
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
      
      // Get all admin users
      const adminUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          role: {
            name: 'admin'
          }
        },
        populate: ['role']
      });

      console.log('🔍 Found admin users:', adminUsers.length);

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

      const notification = await this.createNotification(notificationData);
      console.log('✅ Created seller notification:', notification.id);
      return notification;
    } catch (error) {
      console.error('❌ Error creating seller notification:', error);
      throw error;
    }
  },

  // Create notification via API endpoint
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      console.log('🔔 Creating notification via API:', data);
      
      const notification = await strapi.entityService.create('api::notification.notification', {
        data,
        populate: ['user', 'vendor', 'order', 'product', 'review']
      });
      
      console.log('✅ Notification created via API:', notification);
      
      // Send real-time notification via WebSocket
      try {
        const { sendNotificationToUser, sendNotificationToVendor } = require('../../../websocket');
        
        if (notification.user) {
          sendNotificationToUser(notification.user.id, notification);
        }
        
        if (notification.vendor) {
          sendNotificationToVendor(notification.vendor.id, notification);
        }
        
        console.log('🔌 WebSocket: Real-time notification sent');
      } catch (websocketError) {
        console.error('❌ WebSocket error (non-critical):', websocketError);
      }
      
      return { data: notification };
    } catch (error) {
      console.error('❌ Error creating notification via API:', error);
      return ctx.internalServerError('Failed to create notification');
    }
  },

  // Create bulk notifications for broadcasting with WebSocket integration
  async createBulk(ctx) {
    try {
      const { notifications, targetAudience } = ctx.request.body;
      console.log('🔔 Creating bulk notifications with WebSocket:', notifications.length);
      
      if (!Array.isArray(notifications) || notifications.length === 0) {
        return ctx.badRequest('Notifications array is required and cannot be empty');
      }

      const createdNotifications = [];
      
      for (const notificationData of notifications) {
        try {
          const notification = await strapi.entityService.create('api::notification.notification', {
            data: notificationData,
            populate: ['user', 'vendor']
          });
          createdNotifications.push(notification);
        } catch (error) {
          console.error('❌ Error creating individual notification:', error);
          // Continue with other notifications even if one fails
        }
      }
      
      console.log('✅ Bulk notifications created:', createdNotifications.length);
      
      // Send real-time notifications via WebSocket
      try {
        const { 
          broadcastToAll, 
          broadcastToAllUsers, 
          broadcastToAllVendors,
          sendNotificationToUser,
          sendNotificationToVendor
        } = require('../../../websocket');
        
        // Create a sample notification for broadcasting
        if (createdNotifications.length > 0) {
          const sampleNotification = createdNotifications[0];
          
          switch (targetAudience) {
            case 'all':
              broadcastToAll(sampleNotification);
              break;
            case 'users':
              broadcastToAllUsers(sampleNotification);
              break;
            case 'sellers':
              broadcastToAllVendors(sampleNotification);
              break;
            case 'specific_users':
              // Send to specific users
              createdNotifications.forEach(notification => {
                if (notification.user) {
                  sendNotificationToUser(notification.user.id, notification);
                }
              });
              break;
            case 'specific_sellers':
              // Send to specific vendors
              createdNotifications.forEach(notification => {
                if (notification.vendor) {
                  sendNotificationToVendor(notification.vendor.id, notification);
                }
              });
              break;
          }
          
          console.log('🔌 WebSocket: Real-time bulk notifications sent');
        }
      } catch (websocketError) {
        console.error('❌ WebSocket error (non-critical):', websocketError);
      }
      
      return { 
        data: createdNotifications,
        message: `Successfully created ${createdNotifications.length} notifications`
      };
    } catch (error) {
      console.error('❌ Error creating bulk notifications:', error);
      return ctx.internalServerError('Failed to create bulk notifications');
    }
  },

  // Delete notification
  async deleteNotification(ctx) {
    try {
      const { id } = ctx.params;
      
      await strapi.entityService.delete('api::notification.notification', id);

      return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return ctx.internalServerError('Failed to delete notification');
    }
  },

  // Clear all notifications for a user
  async clearAll(ctx) {
    try {
      const { userId } = ctx.params;
      
      if (!userId) {
        return ctx.badRequest('User ID is required');
      }

      await strapi.db.query('api::notification.notification').deleteMany({
        where: { user: userId }
      });

      return { success: true, message: 'All notifications cleared' };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return ctx.internalServerError('Failed to clear notifications');
    }
  },

  // Send push notification to specific users
  async sendPushToUsers(ctx) {
    try {
      const { userIds, notification, data } = ctx.request.body;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return ctx.badRequest('User IDs array is required');
      }

      if (!notification || !notification.title || !notification.message) {
        return ctx.badRequest('Notification title and message are required');
      }

      const result = await pushNotificationService.sendToUsers(userIds, notification, data);
      
      return {
        success: true,
        message: `Push notification sent to ${result.successCount} users`,
        result
      };
    } catch (error) {
      console.error('Error sending push notification to users:', error);
      return ctx.internalServerError('Failed to send push notification');
    }
  },

  // Send push notification to specific vendors
  async sendPushToVendors(ctx) {
    try {
      const { vendorIds, notification, data } = ctx.request.body;
      
      if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
        return ctx.badRequest('Vendor IDs array is required');
      }

      if (!notification || !notification.title || !notification.message) {
        return ctx.badRequest('Notification title and message are required');
      }

      const result = await pushNotificationService.sendToVendors(vendorIds, notification, data);
      
      return {
        success: true,
        message: `Push notification sent to ${result.successCount} vendors`,
        result
      };
    } catch (error) {
      console.error('Error sending push notification to vendors:', error);
      return ctx.internalServerError('Failed to send push notification');
    }
  },

  // Send push notification to all users
  async sendPushToAllUsers(ctx) {
    try {
      const { notification, data } = ctx.request.body;
      
      if (!notification || !notification.title || !notification.message) {
        return ctx.badRequest('Notification title and message are required');
      }

      const result = await pushNotificationService.sendToAllUsers(notification, data);
      
      return {
        success: true,
        message: `Push notification sent to all ${result.successCount} users`,
        result
      };
    } catch (error) {
      console.error('Error sending push notification to all users:', error);
      return ctx.internalServerError('Failed to send push notification');
    }
  },

  // Send push notification to all vendors
  async sendPushToAllVendors(ctx) {
    try {
      const { notification, data } = ctx.request.body;
      
      if (!notification || !notification.title || !notification.message) {
        return ctx.badRequest('Notification title and message are required');
      }

      const result = await pushNotificationService.sendToAllVendors(notification, data);
      
      return {
        success: true,
        message: `Push notification sent to all ${result.successCount} vendors`,
        result
      };
    } catch (error) {
      console.error('Error sending push notification to all vendors:', error);
      return ctx.internalServerError('Failed to send push notification');
    }
  },

  // Send push notification to everyone
  async sendPushToEveryone(ctx) {
    try {
      const { notification, data } = ctx.request.body;
      
      if (!notification || !notification.title || !notification.message) {
        return ctx.badRequest('Notification title and message are required');
      }

      const result = await pushNotificationService.sendToEveryone(notification, data);
      
      return {
        success: true,
        message: `Push notification sent to ${result.successCount} devices`,
        result
      };
    } catch (error) {
      console.error('Error sending push notification to everyone:', error);
      return ctx.internalServerError('Failed to send push notification');
    }
  },

  // Get notification statistics
  async getNotificationStats(ctx) {
    try {
      const stats = await pushNotificationService.getNotificationStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return ctx.internalServerError('Failed to get notification stats');
    }
  },

  // Update FCM token for a user
  async updateUserToken(ctx) {
    try {
      const { userId } = ctx.params;
      const { fcmToken } = ctx.request.body;
      
      if (!userId) {
        return ctx.badRequest('User ID is required');
      }

      if (!fcmToken) {
        return ctx.badRequest('FCM token is required');
      }

      await pushNotificationService.updateUserToken(userId, fcmToken);
      
      return {
        success: true,
        message: 'FCM token updated successfully'
      };
    } catch (error) {
      console.error('Error updating user FCM token:', error);
      return ctx.internalServerError('Failed to update FCM token');
    }
  },

  // Update FCM token for a vendor
  async updateVendorToken(ctx) {
    try {
      const { vendorId } = ctx.params;
      const { fcmToken } = ctx.request.body;
      
      if (!vendorId) {
        return ctx.badRequest('Vendor ID is required');
      }

      if (!fcmToken) {
        return ctx.badRequest('FCM token is required');
      }

      await pushNotificationService.updateVendorToken(vendorId, fcmToken);
      
      return {
        success: true,
        message: 'FCM token updated successfully'
      };
    } catch (error) {
      console.error('Error updating vendor FCM token:', error);
      return ctx.internalServerError('Failed to update FCM token');
    }
  }
})); 