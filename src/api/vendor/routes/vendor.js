// @ts-nocheck
'use strict';

/**
 * vendor router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::vendor.vendor');

// Customize the default router
const customRouter = (innerRouter, extraRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) routes = innerRouter.routes.concat(extraRoutes);
      return routes;
    },
  };
};

const myExtraRoutes = [
  {
    method: 'GET',
    path: '/vendors/:id/button-click-logs',
    handler: 'api::vendor.vendor.getButtonClickLogs',
    config: {
      auth: false, // Allow unauthenticated access for testing
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/vendors/:id/track-click',
    handler: 'api::vendor.vendor.trackButtonClick',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/vendors/complete-registration',
    handler: 'api::vendor.vendor.completeRegistration',
    config: {
      auth: false, // Allow unauthenticated access for registration completion
      policies: [],
      middlewares: [],
    },
  },
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
];

module.exports = customRouter(defaultRouter, myExtraRoutes); 