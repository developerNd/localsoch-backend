'use strict';
const bcrypt = require('bcryptjs'); // ✅ Add this

module.exports = {
  async test(ctx) {
    return { message: 'Custom auth API is working!' };
  },

  async forgotPassword(ctx) {
    try {
      const { email } = ctx.request.body;
      
      if (!email) {
        return ctx.badRequest('Email is required');
      }

      // Find user by email
      const user = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { email: email.toLowerCase() },
        populate: ['role']
      });

      const targetUser = user[0];

      if (!targetUser) {
        return ctx.badRequest('No account found with this email address');
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP to user record
      await strapi.entityService.update('plugin::users-permissions.user', targetUser.id, {
        data: { resetPasswordToken: otp }
      });

      // Send OTP email
      const emailService = require('../../../services/email');
      const emailResult = await emailService.sendPasswordResetOTP(targetUser.email, otp);
      
      if (!emailResult.success) {
        return ctx.internalServerError('Failed to send OTP email');
      }

      return { message: 'OTP sent successfully to your email address.' };
    } catch (error) {
      return ctx.internalServerError('Failed to process password reset request');
    }
  },

  async resetPassword(ctx) {
    try {
      const { otp, password, passwordConfirmation } = ctx.request.body;
      
      if (!otp || !password || !passwordConfirmation) {
        return ctx.badRequest('OTP, password, and password confirmation are required');
      }

      if (password !== passwordConfirmation) {
        return ctx.badRequest('Passwords do not match');
      }

      if (password.length < 6) {
        return ctx.badRequest('Password must be at least 6 characters long');
      }

      // Find user by OTP
      const user = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { resetPasswordToken: otp }
      });

      const targetUser = user[0];

      if (!targetUser) {
        return ctx.badRequest('Invalid or expired OTP');
      }
      
      // Update user password — Strapi hashes automatically
      await strapi.entityService.update('plugin::users-permissions.user', targetUser.id, {
        data: {
          password: password,             // raw password — Strapi hashes internally
          resetPasswordToken: null
        }
      });
      
      return { message: 'Password reset successfully' };
    } catch (error) {
      return ctx.internalServerError('Failed to reset password');
    }
  }
};
