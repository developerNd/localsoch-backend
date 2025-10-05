'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/auth/test',
      handler: 'auth.test',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/forgot-password',
      handler: 'auth.forgotPassword',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/reset-password',
      handler: 'auth.resetPassword',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: [],
      },
    },
  ],
};
