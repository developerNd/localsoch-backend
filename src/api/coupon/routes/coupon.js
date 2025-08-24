// @ts-nocheck
'use strict';

/**
 * coupon router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::coupon.coupon');

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
    method: 'POST',
    path: '/coupons/validate',
    handler: 'api::coupon.coupon.validateCoupon',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/coupons/create-referral',
    handler: 'api::coupon.coupon.createReferralCoupon',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/coupons/test-referral',
    handler: 'api::coupon.coupon.testReferralCode',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'GET',
    path: '/coupons/test-simple',
    handler: 'api::coupon.coupon.testSimple',
    config: {
      policies: [],
      middlewares: [],
    },
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes); 