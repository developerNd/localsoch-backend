'use strict';

/**
 * websocket controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::websocket.websocket', ({ strapi }) => ({
  // Get WebSocket server status
  async getStatus(ctx) {
    try {
      const { getConnectedUsersCount } = require('../../websocket');
      const connectedUsers = getConnectedUsersCount();
      
      return {
        status: 'running',
        connectedUsers,
        timestamp: new Date().toISOString(),
        message: 'WebSocket server is active and ready for real-time notifications'
      };
    } catch (error) {
      console.error('❌ Error getting WebSocket status:', error);
      return ctx.internalServerError('Failed to get WebSocket status');
    }
  },

  // Get connected users count
  async getConnectedUsers(ctx) {
    try {
      const { getConnectedUsersCount } = require('../../websocket');
      const connectedUsers = getConnectedUsersCount();
      
      return {
        data: connectedUsers,
        message: 'Connected users count retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error getting connected users:', error);
      return ctx.internalServerError('Failed to get connected users');
    }
  },
})); 