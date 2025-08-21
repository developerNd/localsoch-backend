'use strict';

/**
 * button-click-log service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::button-click-log.button-click-log', ({ strapi }) => ({
  // Custom method to log a button click
  async logButtonClick(data) {
    try {
      console.log('🔍 BUTTON-CLICK-LOG SERVICE: === SERVICE CALLED ===');
      console.log('🔍 BUTTON-CLICK-LOG SERVICE: Received data (full):', JSON.stringify(data, null, 2));
      console.log('🔍 BUTTON-CLICK-LOG SERVICE: Data type:', typeof data);
      console.log('🔍 BUTTON-CLICK-LOG SERVICE: Data keys:', Object.keys(data || {}));
      
      // Prepare the data for creation
      const createData = {
        buttonType: data.buttonType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        clickedAt: data.clickedAt || new Date(),
        referrer: data.referrer,
        sessionId: data.sessionId
      };

      // Add vendor relation if provided
      if (data.vendor) {
        createData.vendor = data.vendor;
      }

      // Add userInfo component if provided
      if (data.userInfo) {
        createData.userInfo = data.userInfo;
      }

      // Add deviceInfo component if provided
      if (data.deviceInfo) {
        createData.deviceInfo = data.deviceInfo;
      }

      console.log('🔍 BUTTON-CLICK-LOG SERVICE: Final create data (full):', JSON.stringify(createData, null, 2));
      console.log('🔍 BUTTON-CLICK-LOG SERVICE: About to create entity...');

      const logEntry = await strapi.entityService.create('api::button-click-log.button-click-log', {
        data: createData
      });

      console.log('🔍 BUTTON-CLICK-LOG SERVICE: Entity created successfully:', logEntry);

      console.log('✅ BUTTON-CLICK-LOG SERVICE: Log entry created successfully:', logEntry);

      // Fetch the created entry with populated components
      const populatedLogEntry = await strapi.entityService.findOne('api::button-click-log.button-click-log', logEntry.id, {
        populate: ['userInfo', 'deviceInfo', 'vendor']
      });

      console.log('✅ BUTTON-CLICK-LOG SERVICE: Populated log entry:', populatedLogEntry);

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

      // Calculate analytics with the expected frontend format
      const analytics = {
        totalClicks: logs.length,
        buttonClicks: {
          callClicks: 0,
          whatsappClicks: 0
        },
        buttonTypeStats: {},
        dailyStats: {},
        hourlyStats: {},
        recentLogs: logs.slice(0, 10)
      };

      logs.forEach(log => {
        // Button type stats
        const type = log.buttonType || 'unknown';
        analytics.buttonTypeStats[type] = (analytics.buttonTypeStats[type] || 0) + 1;

        // Map to expected frontend format
        if (type === 'call') {
          analytics.buttonClicks.callClicks++;
        } else if (type === 'whatsapp' || type === 'message') {
          analytics.buttonClicks.whatsappClicks++;
        }

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