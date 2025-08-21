const { sendPushNotification, sendPushNotificationToMultiple, sendPushNotificationToTopic } = require('../config/firebase');

class PushNotificationService {
  // Get all FCM tokens for users
  async getUserTokens(userIds = null) {
    try {
      const filters = { fcmToken: { $notNull: true } };
      if (userIds) {
        filters.id = { $in: userIds };
      }

      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters,
        fields: ['id', 'fcmToken', 'username', 'email']
      });

      return users.filter(user => user.fcmToken);
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }

  // Get all FCM tokens for vendors
  async getVendorTokens(vendorIds = null) {
    try {
      const filters = { fcmToken: { $notNull: true } };
      if (vendorIds) {
        filters.id = { $in: vendorIds };
      }

      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        filters,
        fields: ['id', 'fcmToken', 'name', 'email']
      });

      return vendors.filter(vendor => vendor.fcmToken);
    } catch (error) {
      console.error('Error getting vendor tokens:', error);
      return [];
    }
  }

  // Send push notification to specific users
  async sendToUsers(userIds, notification, data = {}) {
    try {
      const users = await this.getUserTokens(userIds);
      const tokens = users.map(user => user.fcmToken);

      if (tokens.length === 0) {
        console.log('No FCM tokens found for the specified users');
        return { successCount: 0, failureCount: 0 };
      }

      const result = await sendPushNotificationToMultiple(tokens, notification, data);
      
      console.log(`Push notification sent to ${result.successCount} users`);
      return result;
    } catch (error) {
      console.error('Error sending push notification to users:', error);
      throw error;
    }
  }

  // Send push notification to specific vendors
  async sendToVendors(vendorIds, notification, data = {}) {
    try {
      const vendors = await this.getVendorTokens(vendorIds);
      const tokens = vendors.map(vendor => vendor.fcmToken);

      if (tokens.length === 0) {
        console.log('No FCM tokens found for the specified vendors');
        return { successCount: 0, failureCount: 0 };
      }

      const result = await sendPushNotificationToMultiple(tokens, notification, data);
      
      console.log(`Push notification sent to ${result.successCount} vendors`);
      return result;
    } catch (error) {
      console.error('Error sending push notification to vendors:', error);
      throw error;
    }
  }

  // Send push notification to all users
  async sendToAllUsers(notification, data = {}) {
    try {
      const users = await this.getUserTokens();
      const tokens = users.map(user => user.fcmToken);

      if (tokens.length === 0) {
        console.log('No FCM tokens found for users');
        return { successCount: 0, failureCount: 0 };
      }

      const result = await sendPushNotificationToMultiple(tokens, notification, data);
      
      console.log(`Push notification sent to all ${result.successCount} users`);
      return result;
    } catch (error) {
      console.error('Error sending push notification to all users:', error);
      throw error;
    }
  }

  // Send push notification to all vendors
  async sendToAllVendors(notification, data = {}) {
    try {
      const vendors = await this.getVendorTokens();
      const tokens = vendors.map(vendor => vendor.fcmToken);

      if (tokens.length === 0) {
        console.log('No FCM tokens found for vendors');
        return { successCount: 0, failureCount: 0 };
      }

      const result = await sendPushNotificationToMultiple(tokens, notification, data);
      
      console.log(`Push notification sent to all ${result.successCount} vendors`);
      return result;
    } catch (error) {
      console.error('Error sending push notification to all vendors:', error);
      throw error;
    }
  }

  // Send push notification to everyone (users + vendors)
  async sendToEveryone(notification, data = {}) {
    try {
      const users = await this.getUserTokens();
      const vendors = await this.getVendorTokens();
      
      const allTokens = [
        ...users.map(user => user.fcmToken),
        ...vendors.map(vendor => vendor.fcmToken)
      ];

      if (allTokens.length === 0) {
        console.log('No FCM tokens found');
        return { successCount: 0, failureCount: 0 };
      }

      const result = await sendPushNotificationToMultiple(allTokens, notification, data);
      
      console.log(`Push notification sent to everyone: ${result.successCount} successful`);
      return result;
    } catch (error) {
      console.error('Error sending push notification to everyone:', error);
      throw error;
    }
  }

  // Send push notification to a topic
  async sendToTopic(topic, notification, data = {}) {
    try {
      const result = await sendPushNotificationToTopic(topic, notification, data);
      console.log(`Push notification sent to topic: ${topic}`);
      return result;
    } catch (error) {
      console.error('Error sending push notification to topic:', error);
      throw error;
    }
  }

  // Update FCM token for a user
  async updateUserToken(userId, fcmToken) {
    try {
      await strapi.entityService.update('plugin::users-permissions.user', userId, {
        data: { fcmToken }
      });
      console.log(`FCM token updated for user ${userId}`);
    } catch (error) {
      console.error('Error updating user FCM token:', error);
      throw error;
    }
  }

  // Update FCM token for a vendor
  async updateVendorToken(vendorId, fcmToken) {
    try {
      await strapi.entityService.update('api::vendor.vendor', vendorId, {
        data: { fcmToken }
      });
      console.log(`FCM token updated for vendor ${vendorId}`);
    } catch (error) {
      console.error('Error updating vendor FCM token:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      const users = await this.getUserTokens();
      const vendors = await this.getVendorTokens();

      return {
        totalUsers: users.length,
        totalVendors: vendors.length,
        totalDevices: users.length + vendors.length
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { totalUsers: 0, totalVendors: 0, totalDevices: 0 };
    }
  }
}

module.exports = new PushNotificationService(); 