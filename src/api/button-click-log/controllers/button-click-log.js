'use strict';

/**
 * button-click-log controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::button-click-log.button-click-log', ({ strapi }) => ({
  // Override find method to always populate components
  async find(ctx) {
    // Add populate to query if not present
    if (!ctx.query.populate) {
      ctx.query.populate = ['userInfo', 'deviceInfo', 'vendor'];
    } else if (typeof ctx.query.populate === 'string') {
      const populateArray = ctx.query.populate.split(',');
      if (!populateArray.includes('userInfo')) populateArray.push('userInfo');
      if (!populateArray.includes('deviceInfo')) populateArray.push('deviceInfo');
      if (!populateArray.includes('vendor')) populateArray.push('vendor');
      ctx.query.populate = populateArray;
    } else if (Array.isArray(ctx.query.populate)) {
      if (!ctx.query.populate.includes('userInfo')) ctx.query.populate.push('userInfo');
      if (!ctx.query.populate.includes('deviceInfo')) ctx.query.populate.push('deviceInfo');
      if (!ctx.query.populate.includes('vendor')) ctx.query.populate.push('vendor');
    }

    return await super.find(ctx);
  },

  // Override findOne method to always populate components
  async findOne(ctx) {
    // Add populate to query if not present
    if (!ctx.query.populate) {
      ctx.query.populate = ['userInfo', 'deviceInfo', 'vendor'];
    } else if (typeof ctx.query.populate === 'string') {
      const populateArray = ctx.query.populate.split(',');
      if (!populateArray.includes('userInfo')) populateArray.push('userInfo');
      if (!populateArray.includes('deviceInfo')) populateArray.push('deviceInfo');
      if (!populateArray.includes('vendor')) populateArray.push('vendor');
      ctx.query.populate = populateArray;
    } else if (Array.isArray(ctx.query.populate)) {
      if (!ctx.query.populate.includes('userInfo')) ctx.query.populate.push('userInfo');
      if (!ctx.query.populate.includes('deviceInfo')) ctx.query.populate.push('deviceInfo');
      if (!ctx.query.populate.includes('vendor')) ctx.query.populate.push('vendor');
    }

    return await super.findOne(ctx);
  },

  // Custom method to get logs for a specific vendor
  async getVendorLogs(ctx) {
    try {
      const { vendorId } = ctx.params;
      const { page = 1, pageSize = 25 } = ctx.query;

      const logs = await strapi.entityService.findMany('api::button-click-log.button-click-log', {
        filters: { vendor: vendorId },
        sort: { clickedAt: 'desc' },
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        },
        populate: ['vendor', 'userInfo', 'deviceInfo']
      });

      return ctx.send({
        success: true,
        data: logs,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: logs.length,
            pageCount: Math.ceil(logs.length / parseInt(pageSize))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching vendor logs:', error);
      return ctx.internalServerError('Failed to fetch vendor logs');
    }
  },

  // Custom method to get analytics summary
  async getAnalytics(ctx) {
    try {
      const { vendorId } = ctx.params;
      const { startDate, endDate } = ctx.query;

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

      // Group by button type
      const buttonTypeStats = logs.reduce((acc, log) => {
        const type = log.buttonType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Get daily stats
      const dailyStats = logs.reduce((acc, log) => {
        const date = new Date(log.clickedAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return ctx.send({
        success: true,
        data: {
          totalClicks: logs.length,
          buttonTypeStats,
          dailyStats,
          logs: logs.slice(0, 10) // Return last 10 logs
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return ctx.internalServerError('Failed to fetch analytics');
    }
  }
})); 