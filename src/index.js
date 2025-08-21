'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    try {
      // Initialize WebSocket
      const httpServer = strapi.server.httpServer;
      const { initializeWebSocket } = require('./websocket');
      initializeWebSocket(httpServer);
      strapi.log.info('🔌 WebSocket initialized in bootstrap');
      
      // Initialize Firebase Admin SDK
      const { firebaseApp } = require('./config/firebase');
      if (firebaseApp) {
        strapi.log.info('🔥 Firebase Admin SDK initialized in bootstrap');
      } else {
        strapi.log.warn('⚠️ Firebase Admin SDK not initialized - check environment variables');
      }
    } catch (err) {
      strapi.log.error('❌ Failed to initialize services in bootstrap:', err);
    }
  },
};
