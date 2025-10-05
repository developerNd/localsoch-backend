'use strict';

/**
 * Location-based vendor routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/vendors/nearby',
      handler: 'location.nearby',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/vendors/search',
      handler: 'location.search',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: [],
      },
    },
  ],
};
