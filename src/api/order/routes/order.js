'use strict';

/**
 * order router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Default order routes
    {
      method: 'GET',
      path: '/orders',
      handler: 'order.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/orders/:id',
      handler: 'order.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/orders',
      handler: 'order.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/orders/:id',
      handler: 'order.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/orders/:id',
      handler: 'order.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom routes
    {
      method: 'PUT',
      path: '/orders/:id/status',
      handler: 'order.updateStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/orders/:id/status/admin',
      handler: 'order.updateOrderStatusByAdmin',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Invoice route
    {
      method: 'GET',
      path: '/orders/:id/invoice',
      handler: 'order.downloadInvoice',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Customer cancel order route
    {
      method: 'PUT',
      path: '/orders/:id/cancel',
      handler: 'order.cancelOrder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 