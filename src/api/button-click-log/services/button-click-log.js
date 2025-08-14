'use strict';

/**
 * button-click-log service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::button-click-log.button-click-log', ({ strapi }) => ({
  // Custom method to log a button click
  async logButtonClick(data) {
    try {
      const logEntry = await strapi.entityService.create('api::button-click-log.button-click-log', {
        data: {
          ...data,
          clickedAt: data.clickedAt || new Date()
        }
      });

      // Update vendor's button clicks count
      if (data.vendor) {
        const vendor = await strapi.entityService.findOne('api::vendor.vendor', data.vendor, {
          populate: ['buttonClicks']
        });

        if (vendor) {
          const buttonClicks = vendor.buttonClicks || {};
          const buttonType = data.buttonType || 'unknown';
          
          buttonClicks.totalClicks = (buttonClicks.totalClicks || 0) + 1;
          buttonClicks[buttonType] = (buttonClicks[buttonType] || 0) + 1;
          buttonClicks.lastUpdated = new Date();

          await strapi.entityService.update('api::vendor.vendor', data.vendor, {
            data: {
              buttonClicks
            }
          });
        }
      }

      return logEntry;
    } catch (error) {
      console.error('Error logging button click:', error);
      throw error;
    }
  },

  // Custom method to get vendor analytics
  async getVendorAnalytics(vendorId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      let filters = { vendor: vendorId };
      
      if (startDate && endDate) {
        filters.clickedAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const logs = await strapi.entityService.findMany('api::button-click-log.button-click-log', {
        filters,
        sort: { clickedAt: 'desc' }
      });

      // Calculate analytics
      const analytics = {
        totalClicks: logs.length,
        buttonTypeStats: {},
        dailyStats: {},
        hourlyStats: {},
        recentLogs: logs.slice(0, 10)
      };

      logs.forEach(log => {
        // Button type stats
        const type = log.buttonType || 'unknown';
        analytics.buttonTypeStats[type] = (analytics.buttonTypeStats[type] || 0) + 1;

        // Daily stats
        const date = new Date(log.clickedAt).toISOString().split('T')[0];
        analytics.dailyStats[date] = (analytics.dailyStats[date] || 0) + 1;

        // Hourly stats
        const hour = new Date(log.clickedAt).getHours();
        analytics.hourlyStats[hour] = (analytics.hourlyStats[hour] || 0) + 1;
      });

      return analytics;
    } catch (error) {
      console.error('Error getting vendor analytics:', error);
      throw error;
    }
  }
})); 