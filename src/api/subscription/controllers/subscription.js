'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::subscription.subscription', ({ strapi }) => ({
  // Get vendor's current subscription
  async getCurrentSubscription(ctx) {
    try {
      const { vendorId } = ctx.params;
      
      if (!vendorId) {
        return ctx.badRequest('Vendor ID is required');
      }

      const subscription = await strapi.entityService.findMany('api::subscription.subscription', {
        filters: {
          vendor: vendorId,
          status: 'active'
        },
        populate: {
          plan: {
            populate: ['*']
          },
          vendor: {
            populate: ['*']
          }
        },
        sort: { createdAt: 'desc' },
        limit: 1
      });

      if (subscription && subscription.length > 0) {
        return ctx.send({
          success: true,
          data: subscription[0]
        });
      }

      return ctx.send({
        success: true,
        data: null
      });
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return ctx.internalServerError('Failed to get subscription');
    }
  },

  // Create subscription with payment
  async createWithPayment(ctx) {
    try {
      const { vendorId, planId, paymentData } = ctx.request.body;
      
      if (!vendorId || !planId) {
        return ctx.badRequest('Vendor ID and Plan ID are required');
      }

      // Get the plan details
      const plan = await strapi.entityService.findOne('api::subscription-plan.subscription-plan', planId);
      if (!plan) {
        return ctx.badRequest('Plan not found');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      // Create subscription
      const subscription = await strapi.entityService.create('api::subscription.subscription', {
        data: {
          vendor: vendorId,
          plan: planId,
          status: 'active', // Automatically activate since payment is verified
          startDate: startDate,
          endDate: endDate,
          amount: plan.price,
          currency: plan.currency,
          paymentId: paymentData.paymentId,
          orderId: paymentData.orderId,
          paymentMethod: paymentData.paymentMethod,
          features: plan.features,
          autoRenew: false
        },
        populate: ['plan', 'vendor']
      });

      return ctx.send({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      return ctx.internalServerError('Failed to create subscription');
    }
  },

  // Activate subscription after payment verification
  async activateSubscription(ctx) {
    try {
      const { subscriptionId } = ctx.params;
      
      const subscription = await strapi.entityService.update('api::subscription.subscription', subscriptionId, {
        data: {
          status: 'active'
        },
        populate: ['plan', 'vendor']
      });

      return ctx.send({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Error activating subscription:', error);
      return ctx.internalServerError('Failed to activate subscription');
    }
  },

  // Cancel subscription
  async cancelSubscription(ctx) {
    try {
      const { subscriptionId } = ctx.params;
      const { reason } = ctx.request.body;
      
      const subscription = await strapi.entityService.update('api::subscription.subscription', subscriptionId, {
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: reason
        },
        populate: ['plan', 'vendor']
      });

      return ctx.send({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return ctx.internalServerError('Failed to cancel subscription');
    }
  },

  // Get subscription history for vendor
  async getVendorSubscriptions(ctx) {
    try {
      const { vendorId } = ctx.params;
      
      const subscriptions = await strapi.entityService.findMany('api::subscription.subscription', {
        filters: {
          vendor: vendorId
        },
        populate: ['plan'],
        sort: { createdAt: 'desc' }
      });

      return ctx.send({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      console.error('Error getting vendor subscriptions:', error);
      return ctx.internalServerError('Failed to get subscriptions');
    }
  }
})); 