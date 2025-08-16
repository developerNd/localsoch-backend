'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::subscription-plan.subscription-plan', ({ strapi }) => ({
  // Get active plans
  async getActivePlans(ctx) {
    try {
      const plans = await strapi.entityService.findMany('api::subscription-plan.subscription-plan', {
        filters: {
          isActive: true
        },
        sort: { sortOrder: 'asc' }
      });

      return ctx.send({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Error getting active plans:', error);
      return ctx.internalServerError('Failed to get plans');
    }
  },

  // Get popular plans
  async getPopularPlans(ctx) {
    try {
      const plans = await strapi.entityService.findMany('api::subscription-plan.subscription-plan', {
        filters: {
          isActive: true,
          isPopular: true
        },
        sort: { sortOrder: 'asc' }
      });

      return ctx.send({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Error getting popular plans:', error);
      return ctx.internalServerError('Failed to get popular plans');
    }
  }
})); 