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

      // Try using the query builder for better population control
      const subscription = await strapi.db.query('api::subscription.subscription').findMany({
        where: {
          vendor: vendorId,
          status: 'active'
        },
        populate: {
          plan: true,
          vendor: true
        },
        orderBy: { createdAt: 'desc' },
        limit: 1
      });

      if (subscription && subscription.length > 0) {
        const subscriptionData = subscription[0];
        
        // If plan is not populated, try to fetch it separately
        if (subscriptionData.plan && typeof subscriptionData.plan === 'number') {
          try {
            const planData = await strapi.entityService.findOne('api::subscription-plan.subscription-plan', subscriptionData.plan, {
              populate: ['*']
            });
            subscriptionData.plan = planData;
          } catch (error) {
            console.error('Error fetching plan data:', error);
          }
        }
        
        return ctx.send({
          success: true,
          data: subscriptionData
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

      // Generate invoice data for the subscription
      try {
        const subscriptionService = strapi.service('api::subscription.subscription');
        const invoiceData = subscriptionService.generateSubscriptionInvoiceData(subscription);
        
        // Store invoice data in subscription notes for reference
        await strapi.entityService.update('api::subscription.subscription', subscription.id, {
          data: {
            notes: `Invoice: ${invoiceData.invoiceNumber} | Generated: ${invoiceData.invoiceDate}`
          }
        });
        
      } catch (invoiceError) {
        console.error('Warning: Failed to generate invoice data:', invoiceError);
        // Don't fail the subscription creation if invoice generation fails
      }

      return ctx.send({
        success: true,
        data: subscription,
        message: 'Subscription created successfully with payment verification'
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

  // Download subscription invoice
  async downloadInvoice(ctx) {
    try {
      const { id } = ctx.params;
      
      // Get the authenticated user
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in to download invoices.');
      }

      // Get the subscription with all details
      const subscription = await strapi.entityService.findOne('api::subscription.subscription', id, {
        populate: ['vendor', 'plan']
      });

      if (!subscription) {
        return ctx.notFound('Subscription not found');
      }

      // Check if user has permission to access this subscription
      if (subscription.vendor && subscription.vendor.user && subscription.vendor.user.id !== user.id) {
        return ctx.forbidden('You can only download invoices for your own subscriptions');
      }

      // Get subscription service
      const subscriptionService = strapi.service('api::subscription.subscription');
      
      if (!subscriptionService) {
        return ctx.internalServerError('Subscription service not available');
      }
      
      // Generate invoice data
      const invoiceData = subscriptionService.generateSubscriptionInvoiceData(subscription);
      
      // Generate text invoice
      const invoiceText = subscriptionService.generateSubscriptionTextInvoice(invoiceData);
      
      // Generate filename
      const filename = subscriptionService.generateSubscriptionInvoiceFilename(invoiceData);

      // Set response headers for file download
      ctx.set('Content-Type', 'text/plain');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Send the invoice content
      ctx.body = invoiceText;

    } catch (error) {
      console.error('Error generating subscription invoice:', error);
      return ctx.internalServerError('Failed to generate subscription invoice');
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