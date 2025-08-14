'use strict';

/**
 * button-click-log router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::button-click-log.button-click-log');

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
    path: '/button-click-logs/vendor/:vendorId',
    handler: 'api::button-click-log.button-click-log.getVendorLogs',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'GET',
    path: '/button-click-logs/vendor/:vendorId/analytics',
    handler: 'api::button-click-log.button-click-log.getAnalytics',
    config: {
      policies: [],
      middlewares: [],
    },
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes); 