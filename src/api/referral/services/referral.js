'use strict';

/**
 * referral service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::referral.referral', ({ strapi }) => ({
  // Apply referral code
  async applyCode(ctx) {
    try {
      const { referralCode, newUserId, userType = 'user' } = ctx.request.body;
      
      if (!referralCode || !newUserId) {
        return ctx.badRequest('Referral code and user ID are required');
      }

      const referral = await strapi.entityService.findMany('api::referral.referral', {
        filters: {
          referralCode: referralCode,
          status: 'pending'
        }
      });

      if (referral.length === 0) {
        return ctx.send({
          success: false,
          message: 'Invalid or expired referral code'
        });
      }

      const referralData = referral[0];
      
      // Check if code is expired
      if (referralData.expiresAt && new Date() > new Date(referralData.expiresAt)) {
        return ctx.send({
          success: false,
          message: 'Referral code has expired'
        });
      }

      // Determine rewards based on user type
      let userReward = 0;
      let sellerDiscount = 0;
      let rewardMessage = '';

      if (userType === 'user') {
        // If regular user logs in: User gets ₹10
        userReward = 10;
        rewardMessage = 'Referral code applied! You get ₹10 cashback.';
      } else if (userType === 'seller') {
        // If seller logs in: Seller gets 20% discount
        sellerDiscount = 20;
        rewardMessage = 'Referral code applied! You get 20% discount on seller registration.';
      } else {
        rewardMessage = 'Referral code applied successfully.';
      }

      // Update referral status with new reward information
      await strapi.entityService.update('api::referral.referral', referralData.id, {
        data: {
          referredUser: newUserId,
          status: 'completed',
          completedAt: new Date(),
          userReward: userReward,
          sellerDiscount: sellerDiscount,
          userType: userType
        }
      });

      // Update referrer's total rewards if user gets benefit
      if (userReward > 0) {
        const referrer = await strapi.entityService.findOne('plugin::users-permissions.user', referralData.referrer);
        const currentRewards = parseFloat(referrer.totalRewards || 0);
        await strapi.entityService.update('plugin::users-permissions.user', referralData.referrer, {
          data: {
            totalRewards: currentRewards + userReward
          }
        });
      }

      return ctx.send({
        success: true,
        message: rewardMessage,
        userReward: userReward,
        sellerDiscount: sellerDiscount,
        userType: userType
      });
    } catch (error) {
      console.error('Error applying referral code:', error);
      return ctx.badRequest('Failed to apply referral code');
    }
  },

  // Validate referral code
  async validateCode(ctx) {
    try {
      const { referralCode } = ctx.request.body;
      
      if (!referralCode) {
        return ctx.badRequest('Referral code is required');
      }

      const referral = await strapi.entityService.findMany('api::referral.referral', {
        filters: {
          referralCode: referralCode,
          status: 'pending'
        },
        populate: ['referrer']
      });

      if (referral.length === 0) {
        return ctx.send({
          success: false,
          message: 'Invalid or expired referral code'
        });
      }

      const referralData = referral[0];
      
      // Check if code is expired
      if (referralData.expiresAt && new Date() > new Date(referralData.expiresAt)) {
        return ctx.send({
          success: false,
          message: 'Referral code has expired'
        });
      }

      return ctx.send({
        success: true,
        referral: {
          id: referralData.id,
          referralCode: referralData.referralCode,
          rewardAmount: referralData.rewardAmount,
          rewardType: referralData.rewardType,
          referrer: {
            id: referralData.referrer.id,
            username: referralData.referrer.username
          }
        }
      });
    } catch (error) {
      console.error('Error validating referral code:', error);
      return ctx.badRequest('Failed to validate referral code');
    }
  }
})); 