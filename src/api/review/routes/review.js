'use strict';

/**
 * review router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Default review routes
    {
      method: 'GET',
      path: '/reviews',
      handler: 'review.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/reviews/:id',
      handler: 'review.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/reviews',
      handler: 'review.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/reviews/:id',
      handler: 'review.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/reviews/:id',
      handler: 'review.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom routes for seller reviews
    {
      method: 'GET',
      path: '/reviews/seller/:vendorId',
      handler: 'review.findForSeller',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/reviews/seller/:vendorId/stats',
      handler: 'review.getSellerStats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/reviews/:id/approval',
      handler: 'review.updateApproval',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 