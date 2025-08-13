'use strict';

module.exports = {
  routes: [
    // Admin-specific order routes
    {
      method: 'GET',
      path: '/orders/admin/all',
      handler: 'order.findAllForAdmin',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/orders/admin/stats',
      handler: 'order.getOrderStats',
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
  ],
}; 