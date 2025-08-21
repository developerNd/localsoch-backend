'use strict';

/**
 * notification router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Default notification routes
    {
      method: 'GET',
      path: '/notifications',
      handler: 'notification.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/notifications/:id',
      handler: 'notification.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/notifications',
      handler: 'notification.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/notifications/bulk',
      handler: 'notification.createBulk',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/notifications/:id',
      handler: 'notification.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/notifications/:id',
      handler: 'notification.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom routes for notifications
    {
      method: 'GET',
      path: '/notifications/user/:userId',
      handler: 'notification.findForUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/notifications/vendor/:vendorId',
      handler: 'notification.findForVendor',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/notifications/:id/read',
      handler: 'notification.markAsRead',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/notifications/user/:userId/read-all',
      handler: 'notification.markAllAsRead',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/notifications/user/:userId/unread-count',
      handler: 'notification.getUnreadCount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/notifications/vendor/:vendorId/unread-count',
      handler: 'notification.getVendorUnreadCount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/notifications/:id/delete',
      handler: 'notification.deleteNotification',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/notifications/user/:userId/clear-all',
      handler: 'notification.clearAll',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Push notification routes
    {
      method: 'POST',
      path: '/notifications/push/users',
      handler: 'notification.sendPushToUsers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/notifications/push/vendors',
      handler: 'notification.sendPushToVendors',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/notifications/push/all-users',
      handler: 'notification.sendPushToAllUsers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/notifications/push/all-vendors',
      handler: 'notification.sendPushToAllVendors',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/notifications/push/everyone',
      handler: 'notification.sendPushToEveryone',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/notifications/push/stats',
      handler: 'notification.getNotificationStats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/notifications/push/user/:userId/token',
      handler: 'notification.updateUserToken',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/notifications/push/vendor/:vendorId/token',
      handler: 'notification.updateVendorToken',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 