// @ts-nocheck
'use strict';

/**
 * referral controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::referral.referral', ({ strapi }) => ({
  // Generate referral code for a user
  async generateCode(ctx) {
    try {
      // Get user from Authorization header
      const authHeader = ctx.request.header.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.unauthorized('User not authenticated');
      }
      
      const token = authHeader.substring(7);
      const { payload } = await strapi.plugins['users-permissions'].services.jwt.verify(token);
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', payload.id);
      
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      // Check if user already has a referral code
      const existingReferral = await strapi.entityService.findMany('api::referral.referral', {
        filters: {
          referrer: user.id,
          status: 'pending'
        }
      });

      if (existingReferral.length > 0) {
        return ctx.send({
          success: true,
          referralCode: existingReferral[0].referralCode,
          message: 'Referral code already exists'
        });
      }

      // Generate unique referral code
      const referralCode = `REF${user.id}${Date.now().toString().slice(-6)}`;
      
      // Create referral record
      const referral = await strapi.entityService.create('api::referral.referral', {
        data: {
          referrer: user.id,
          referralCode: referralCode,
          status: 'pending',
          rewardAmount: 50,
          rewardType: 'cashback',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          publishedAt: new Date()
        }
      });

      return ctx.send({
        success: true,
        referralCode: referralCode,
        message: 'Referral code generated successfully'
      });
    } catch (error) {
      console.error('Error generating referral code:', error);
      return ctx.badRequest('Failed to generate referral code');
    }
  },

  // Get user's referral statistics
  async getStats(ctx) {
    try {
      // Get user from Authorization header
      const authHeader = ctx.request.header.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.unauthorized('User not authenticated');
      }
      
      const token = authHeader.substring(7);
      const { payload } = await strapi.plugins['users-permissions'].services.jwt.verify(token);
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', payload.id);
      
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }

      // Get all referrals by this user
      const referrals = await strapi.entityService.findMany('api::referral.referral', {
        filters: {
          referrer: user.id
        },
        populate: ['referredUser']
      });

      const stats = {
        totalReferrals: referrals.length,
        pendingReferrals: referrals.filter(r => r.status === 'pending').length,
        completedReferrals: referrals.filter(r => r.status === 'completed').length,
        totalRewards: referrals
          .filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + parseFloat(r.rewardAmount || 0), 0),
        referrals: referrals.map(r => ({
          id: r.id,
          referralCode: r.referralCode,
          status: r.status,
          rewardAmount: r.rewardAmount,
          rewardType: r.rewardType,
          completedAt: r.completedAt,
          expiresAt: r.expiresAt,
          referredUser: r.referredUser ? {
            id: r.referredUser.id,
            username: r.referredUser.username,
            email: r.referredUser.email
          } : null
        }))
      };

      return ctx.send({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return ctx.badRequest('Failed to get referral statistics');
    }
  },

  // Validate referral code
  async validateCode(ctx) {
    try {
      // Get user from Authorization header
      const authHeader = ctx.request.header.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.unauthorized('User not authenticated');
      }
      
      const token = authHeader.substring(7);
      const { payload } = await strapi.plugins['users-permissions'].services.jwt.verify(token);
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', payload.id);
      
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }
      
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
          referrer: referralData.referrer ? {
            id: referralData.referrer.id,
            username: referralData.referrer.username
          } : null
        }
      });
    } catch (error) {
      console.error('Error validating referral code:', error);
      return ctx.badRequest('Failed to validate referral code');
    }
  },

  // Apply referral code during registration
  async applyCode(ctx) {
    try {
      // Get user from Authorization header
      const authHeader = ctx.request.header.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.unauthorized('User not authenticated');
      }
      
      const token = authHeader.substring(7);
      const { payload } = await strapi.plugins['users-permissions'].services.jwt.verify(token);
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', payload.id);
      
      if (!user) {
        return ctx.unauthorized('User not authenticated');
      }
      
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
        // If regular user logs in: User gets 20% discount coupon
        userReward = 0; // No cashback, only coupon
        rewardMessage = 'Referral code applied! You get a 20% discount coupon for your first order.';
        
        // Note: We no longer create coupons during registration
        // Referral codes are used directly as coupon codes during checkout
        console.log('✅ Referral code applied successfully');
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
  }
})); 