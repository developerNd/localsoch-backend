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
  },

  // Override the findOne method to ensure it works properly
  async findOne(ctx) {
    const { id } = ctx.params;
    
    try {
      const plan = await strapi.entityService.findOne('api::subscription-plan.subscription-plan', id);
      
      if (!plan) {
        return ctx.notFound('Subscription plan not found');
      }
      
      return ctx.send({ data: plan });
    } catch (error) {
      console.error('Error finding subscription plan:', error);
      return ctx.internalServerError('Failed to find subscription plan');
    }
  },

  // Override the update method to ensure it works properly
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    try {
      const plan = await strapi.entityService.update('api::subscription-plan.subscription-plan', id, {
        data
      });
      
      return ctx.send({ data: plan });
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return ctx.internalServerError('Failed to update subscription plan');
    }
  },

  // Override the create method to ensure it works properly
  async create(ctx) {
    const { data } = ctx.request.body;
    
    try {
      const plan = await strapi.entityService.create('api::subscription-plan.subscription-plan', {
        data
      });
      
      return ctx.send({ data: plan });
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return ctx.internalServerError('Failed to create subscription plan');
    }
  }
})); 