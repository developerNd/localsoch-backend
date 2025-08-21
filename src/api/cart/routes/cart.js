'use strict';

/**
 * cart router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Mobile app cart routes (exactly matching the app requirements)
    {
      method: 'GET',
      path: '/cart',
      handler: 'cart.getUserCart',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/cart',
      handler: 'cart.addToCart',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/cart/:id',
      handler: 'cart.updateCartItem',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/cart/:id',
      handler: 'cart.removeFromCart',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/cart/clear',
      handler: 'cart.clearCart',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Admin routes for managing all carts
    {
      method: 'GET',
      path: '/carts',
      handler: 'cart.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/carts/:id',
      handler: 'cart.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/carts',
      handler: 'cart.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/carts/:id',
      handler: 'cart.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/carts/:id',
      handler: 'cart.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 