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
  ],
}; 