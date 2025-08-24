// @ts-nocheck
'use strict';

/**
 * coupon controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::coupon.coupon', ({ strapi }) => ({
  // Validate and apply coupon code
  async validateCoupon(ctx) {
    try {
      const { couponCode, orderAmount, userId } = ctx.request.body;
      
      if (!couponCode || !orderAmount) {
        return ctx.badRequest('Coupon code and order amount are required');
      }

      // Check for coupons in database
      let coupon = [];
      let isStaticCoupon = false;
      
      // Check coupons in database
      coupon = await strapi.entityService.findMany('api::coupon.coupon', {
        filters: {
          code: couponCode,
          isActive: true
        },
        populate: ['usedBy']
      });

      // Check if it's the static coupon
      if (coupon.length > 0 && couponCode === 'REF1234567890ABCD') {
        isStaticCoupon = true;
      }

      if (coupon.length === 0) {

        return ctx.send({
          success: false,
          message: 'Invalid coupon code. Please check the code and try again.'
        });
      }

      const couponData = coupon[0];
      
      // Check if coupon is expired
      if (couponData.expiresAt && new Date() > new Date(couponData.expiresAt)) {
        return ctx.send({
          success: false,
          message: 'This coupon has expired. Please use a valid coupon code.'
        });
      }

      // Check minimum order amount
      if (couponData.minOrderAmount && orderAmount < couponData.minOrderAmount) {
        return ctx.send({
          success: false,
          message: `Minimum order amount of ₹${couponData.minOrderAmount} required to use this coupon.`
        });
      }

      // Check usage limit - only for regular coupons, not for static coupons
      // Static coupons (like REF1234567890ABCD) should allow unlimited users but one use per user
      if (!isStaticCoupon && couponData.usageLimit && couponData.usedCount >= couponData.usageLimit) {
        return ctx.send({
          success: false,
          message: 'This coupon has reached its usage limit. Please try a different coupon.'
        });
      }

      // Check if user has already used this coupon
      if (userId) {
        let hasUsed = false;
        
        if (isStaticCoupon) {
          // For static coupons, check the simple boolean field in user table
          const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
            fields: ['hasUsedStaticCoupon']
          });
          hasUsed = user?.hasUsedStaticCoupon || false;
        } else {
          // For regular coupons, check the usedBy relation
          if (couponData.usedBy) {
            if (Array.isArray(couponData.usedBy)) {
              hasUsed = couponData.usedBy.some(user => user.id === userId);
            } else {
              hasUsed = couponData.usedBy.id === userId;
            }
          }
        }
        
        if (hasUsed) {
          return ctx.send({
            success: false,
            message: 'This coupon has already been used by you. Each coupon can only be used once per user.'
          });
        }
      }

      // Calculate discount
      let discountAmount = 0;
      if (couponData.discountPercentage > 0) {
        discountAmount = (orderAmount * couponData.discountPercentage) / 100;
      } else if (couponData.discountAmount > 0) {
        discountAmount = couponData.discountAmount;
      }

      // Apply maximum discount limit
      if (couponData.maxDiscountAmount > 0 && discountAmount > couponData.maxDiscountAmount) {
        discountAmount = couponData.maxDiscountAmount;
      }

      // Round to 2 decimal places to avoid floating point issues
      discountAmount = Math.round(discountAmount * 100) / 100;
      const finalAmount = Math.round((orderAmount - discountAmount) * 100) / 100;

      // Mark coupon as used by this user
      if (userId) {
        try {
          if (isStaticCoupon) {
            // For static coupons, update the user's hasUsedStaticCoupon field
            await strapi.entityService.update('plugin::users-permissions.user', userId, {
              data: {
                hasUsedStaticCoupon: true
              }
            });
          } else {
            // For regular coupons, update the coupon's usedBy relation and usedCount
            let currentUsedBy = couponData.usedBy || [];
            
            // Ensure currentUsedBy is an array
            if (!Array.isArray(currentUsedBy)) {
              currentUsedBy = currentUsedBy ? [currentUsedBy] : [];
            }
            
            // Check if user is already in the usedBy array
            const userAlreadyUsed = currentUsedBy.some(user => user.id === userId);
            
            if (!userAlreadyUsed) {
              const updatedUsedBy = [...currentUsedBy, userId];
              
              await strapi.entityService.update('api::coupon.coupon', couponData.id, {
                data: {
                  usedBy: updatedUsedBy,
                  usedCount: (couponData.usedCount || 0) + 1
                }
              });
            }
          }
        } catch (error) {
          console.error('Error marking coupon as used:', error);
          // Don't fail the validation if marking as used fails
        }
      }



      return ctx.send({
        success: true,
        coupon: {
          id: couponData.id,
          code: couponData.code,
          discountPercentage: couponData.discountPercentage,
          discountAmount: discountAmount,
          finalAmount: finalAmount,
          description: couponData.description
        }
      });
    } catch (error) {
      console.error('Error validating coupon:', error);
      return ctx.badRequest('Failed to validate coupon');
    }
  },

  // Create referral coupon for user
  async createReferralCoupon(ctx) {
    try {
      const { userId, referralCode } = ctx.request.body;
      
      if (!userId || !referralCode) {
        return ctx.badRequest('User ID and referral code are required');
      }

      // Generate coupon code from referral code
      const couponCode = `REF${referralCode}`;
      
      // Check if coupon already exists
      const existingCoupon = await strapi.entityService.findMany('api::coupon.coupon', {
        filters: {
          code: couponCode
        }
      });

      if (existingCoupon.length > 0) {
        return ctx.send({
          success: true,
          couponCode: couponCode,
          message: 'Referral coupon already exists'
        });
      }

      // Create coupon
      const coupon = await strapi.entityService.create('api::coupon.coupon', {
        data: {
          code: couponCode,
          discountPercentage: 20,
          minOrderAmount: 100,
          usageLimit: 1,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          createdBy: userId,
          couponType: 'referral',
          description: '20% off on your first order using referral code',
          publishedAt: new Date()
        }
      });

      return ctx.send({
        success: true,
        couponCode: couponCode,
        message: 'Referral coupon created successfully'
      });
    } catch (error) {
      console.error('Error creating referral coupon:', error);
      return ctx.badRequest('Failed to create referral coupon');
    }
  },

  // Test endpoint to check referral codes
  async testReferralCode(ctx) {
    try {
      const { code } = ctx.request.body;
      

      
      const referral = await strapi.entityService.findMany('api::referral.referral', {
        filters: {
          referralCode: code
        }
      });
      

      
      return ctx.send({
        success: true,
        found: referral.length > 0,
        referral: referral.length > 0 ? referral[0] : null
      });
    } catch (error) {
      console.error('Error testing referral code:', error);
      return ctx.badRequest('Failed to test referral code');
    }
  },

  // Simple test endpoint - no auth required
  async testSimple(ctx) {
    try {

      return ctx.send({
        success: true,
        message: 'Simple test endpoint working!',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in simple test:', error);
      return ctx.badRequest('Failed to test simple endpoint');
    }
  }
})); 