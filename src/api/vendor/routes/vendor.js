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
];

module.exports = customRouter(defaultRouter, myExtraRoutes); 