'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::subscription.subscription');

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
    path: '/subscriptions/vendor/:vendorId/current',
    handler: 'subscription.getCurrentSubscription',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/subscriptions/create-with-payment',
    handler: 'subscription.createWithPayment',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'PUT',
    path: '/subscriptions/:subscriptionId/activate',
    handler: 'subscription.activateSubscription',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'PUT',
    path: '/subscriptions/:subscriptionId/cancel',
    handler: 'subscription.cancelSubscription',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'GET',
    path: '/subscriptions/vendor/:vendorId/history',
    handler: 'subscription.getVendorSubscriptions',
    config: {
      policies: [],
      middlewares: [],
    },
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes); 