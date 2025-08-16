'use strict';

/**
 * analytics router
 */

// Add custom route for dashboard stats
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/analytics/dashboard-stats',
      handler: 'analytics.getDashboardStats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 