'use strict';

/**
 * review controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', ({ strapi }) => ({
  // Get reviews for a specific seller
  async findForSeller(ctx) {
    try {
      const { vendorId } = ctx.params;
      
      console.log('🔍 Fetching reviews for vendor ID:', vendorId, 'Type:', typeof vendorId);
      
      if (!vendorId) {
        console.log('🔍 No vendor ID provided');
        return ctx.badRequest('Vendor ID is required');
      }

      // Convert vendorId to number if it's a string
      const numericVendorId = parseInt(vendorId, 10);
      console.log('🔍 Converted vendor ID to number:', numericVendorId);

      const reviews = await strapi.entityService.findMany('api::review.review', {
        filters: { vendor: numericVendorId },
        populate: ['order', 'user', 'vendor'],
        sort: { createdAt: 'desc' }
      });

      console.log('🔍 Found reviews for vendor:', reviews.length, reviews);
      return { data: reviews };
    } catch (error) {
      console.error('Error fetching seller reviews:', error);
      return ctx.internalServerError('Failed to fetch reviews');
    }
  },

  // Get review statistics for a seller
  async getSellerStats(ctx) {
    try {
      const { vendorId } = ctx.params;
      
      console.log('🔍 Fetching review stats for vendor ID:', vendorId, 'Type:', typeof vendorId);
      
      if (!vendorId) {
        console.log('🔍 No vendor ID provided for stats');
        return ctx.badRequest('Vendor ID is required');
      }

      // Convert vendorId to number if it's a string
      const numericVendorId = parseInt(vendorId, 10);
      console.log('🔍 Converted vendor ID to number for stats:', numericVendorId);

      const reviews = await strapi.entityService.findMany('api::review.review', {
        filters: { 
          vendor: numericVendorId,
          isApproved: true 
        },
        populate: ['order', 'vendor']
      });

      console.log('🔍 Found reviews for stats:', reviews.length);

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

      const stats = {
        totalReviews,
        averageRating,
        ratingDistribution
      };

      console.log('🔍 Calculated stats:', stats);

      return {
        data: stats
      };
    } catch (error) {
      console.error('Error fetching seller review stats:', error);
      return ctx.internalServerError('Failed to fetch review statistics');
    }
  },

  // Create a review (for customers)
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      console.log('🔍 Creating review with data:', data);
      
      // Validate required fields
      if (!data.rating || !data.customerName) {
        console.log('🔍 Validation failed: missing rating or customerName');
        return ctx.badRequest('Rating and customer name are required');
      }

      // Validate rating range
      if (data.rating < 1 || data.rating > 5) {
        console.log('🔍 Validation failed: invalid rating range');
        return ctx.badRequest('Rating must be between 1 and 5');
      }

      console.log('🔍 Creating review in database...');
      const review = await strapi.entityService.create('api::review.review', {
        data,
        populate: ['vendor', 'order', 'user']
      });

      console.log('🔍 Review created successfully:', review);
      
      // Verify the review was created with correct vendor
      if (review.vendor) {
        console.log('🔍 Review vendor ID:', review.vendor.id || review.vendor);
      }

      // Create notification for the vendor
      try {
        if (review.vendor && review.vendor.user) {
          const notificationData = {
            title: 'New Review Received',
            message: `You have received a ${review.rating}-star review from ${review.customerName}`,
            type: 'review',
            user: review.vendor.user.id,
            vendor: review.vendor.id,
            review: review.id,
            actionUrl: `/reviews/${review.id}`,
            actionText: 'View Review',
            isImportant: review.rating <= 2 // Important for low ratings
          };

          console.log('🔔 Creating review notification:', notificationData);

          const notification = await strapi.entityService.create('api::notification.notification', {
            data: notificationData,
            populate: ['user', 'vendor', 'review']
          });
          
          console.log('✅ Review notification created:', notification);
        }
      } catch (notificationError) {
        console.error('❌ Error creating review notification:', notificationError);
        // Don't fail the review creation if notification fails
      }
      
      return { data: review };
    } catch (error) {
      console.error('Error creating review:', error);
      return ctx.internalServerError('Failed to create review');
    }
  },

  // Update review approval status (for admins)
  async updateApproval(ctx) {
    try {
      const { id } = ctx.params;
      const { isApproved } = ctx.request.body;

      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role?.name !== 'admin') {
        return ctx.forbidden('Admin access required');
      }

      const review = await strapi.entityService.update('api::review.review', id, {
        data: { isApproved },
        populate: ['vendor']
      });

      return { data: review };
    } catch (error) {
      console.error('Error updating review approval:', error);
      return ctx.internalServerError('Failed to update review');
    }
  }
})); 