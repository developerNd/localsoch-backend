'use strict';

module.exports = {
  routes: [
    // Admin-specific vendor routes
    {
      method: 'GET',
      path: '/vendors/admin/all',
      handler: 'vendor.findAllForAdmin',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/vendors/:id/status',
      handler: 'vendor.updateVendorStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/vendors/admin/stats',
      handler: 'vendor.getVendorStats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 