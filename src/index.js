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

      // Set up scheduled job to check expired offers daily at 12:05 AM
      const schedule = require('node-schedule');
      
      // Run daily at 12:05 AM (5 minutes after midnight to ensure all offers have expired)
      schedule.scheduleJob('5 0 * * *', async () => {
        try {
          strapi.log.info('🕐 Running daily expired offers cleanup at 12:05 AM...');
          const result = await strapi.service('api::product.product').checkExpiredOffers();
          strapi.log.info(`✅ Daily expired offers cleanup completed: ${result.updatedCount} products updated`);
        } catch (error) {
          strapi.log.error('❌ Error in daily expired offers cleanup:', error);
        }
      });
      
      strapi.log.info('⏰ Scheduled job for expired offers cleanup initialized (runs daily at 12:05 AM)');
      
    } catch (err) {
      strapi.log.error('❌ Failed to initialize services in bootstrap:', err);
    }
  },
};
