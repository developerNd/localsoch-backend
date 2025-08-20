'use strict';

/**
 * notification controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

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

      console.log('🔍 Unread count for user', userId, ':', count);

      return { data: { count } };
    } catch (error) {
      console.error('Error getting unread count:', error);
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

      console.log('🔍 Unread count for vendor', vendorId, ':', count);

      return { data: { count } };
    } catch (error) {
      console.error('Error getting vendor unread count:', error);
      return ctx.internalServerError('Failed to get vendor unread count');
    }
  },

  // Create notification (utility function for other controllers)
  async createNotification(notificationData) {
    try {
      console.log('🔔 Creating notification with data:', notificationData);
      
      // Ensure isRead is explicitly set to false
      const notificationDataWithDefaults = {
        ...notificationData,
        isRead: false
      };
      
      console.log('🔔 Final notification data:', notificationDataWithDefaults);
      
      const notification = await strapi.entityService.create('api::notification.notification', {
        data: notificationDataWithDefaults,
        populate: ['user', 'vendor', 'order', 'product', 'review']
      });
      
      console.log('✅ Notification created successfully:', notification);
      console.log('✅ Notification isRead value:', notification.isRead);
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
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
      return { data: notification };
    } catch (error) {
      console.error('❌ Error creating notification via API:', error);
      return ctx.internalServerError('Failed to create notification');
    }
  },

  // Create bulk notifications for broadcasting
  async createBulk(ctx) {
    try {
      const { notifications } = ctx.request.body;
      console.log('🔔 Creating bulk notifications:', notifications.length);
      
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
  }
})); 