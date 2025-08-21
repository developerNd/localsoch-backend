'use strict';

/**
 * websocket router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/websocket/status',
      handler: 'websocket.getStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/websocket/connected-users',
      handler: 'websocket.getConnectedUsers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 