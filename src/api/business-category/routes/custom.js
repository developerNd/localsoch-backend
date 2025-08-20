'use strict';

/**
 * Custom business-category routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/business-categories/custom',
      handler: 'business-category.createCustom',
      config: {
        auth: false, // Allow unauthenticated access for signup
      },
    },
  ],
}; 