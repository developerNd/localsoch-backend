'use strict';

/**
 * business-category router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// Create custom routes to bypass authentication
module.exports = {
  routes: [
    // Default routes
    {
      method: 'GET',
      path: '/business-categories',
      handler: 'business-category.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/business-categories/:id',
      handler: 'business-category.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Admin routes for CRUD operations
    {
      method: 'POST',
      path: '/business-categories',
      handler: 'business-category.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/business-categories/:id',
      handler: 'business-category.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/business-categories/:id',
      handler: 'business-category.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 