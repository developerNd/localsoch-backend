'use strict';

/**
 * product router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// Create a completely custom router without default policies
module.exports = {
  routes: [
    // Default product routes with no policies
    {
      method: 'GET',
      path: '/products',
      handler: 'product.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/products/:id',
      handler: 'product.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Create, Update, Delete routes
    {
      method: 'POST',
      path: '/products',
      handler: 'product.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/products/:id',
      handler: 'product.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/products/:id',
      handler: 'product.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Admin-specific routes
    {
      method: 'GET',
      path: '/products/admin/all',
      handler: 'product.findAllForAdmin',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/products/:id/status',
      handler: 'product.updateProductStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/products/admin/stats',
      handler: 'product.getProductStats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom routes
    {
      method: 'GET',
      path: '/products/vendor/:vendorId',
      handler: 'product.findByVendor',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/products/public-test',
      handler: 'product.publicTest',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 