'use strict';

/**
 * subscription-plan router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// Create custom routes to bypass authentication
module.exports = {
  routes: [
    // Default routes
    {
      method: 'GET',
      path: '/subscription-plans',
      handler: 'subscription-plan.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/subscription-plans/:id',
      handler: 'subscription-plan.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Admin routes for CRUD operations
    {
      method: 'POST',
      path: '/subscription-plans',
      handler: 'subscription-plan.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/subscription-plans/:id',
      handler: 'subscription-plan.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/subscription-plans/:id',
      handler: 'subscription-plan.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 