'use strict';

/**
 * @typedef {Object} StrapiGlobal
 * @property {Object} entityService
 * @property {Object} plugins
 */

/**
 * @global
 * @type {StrapiGlobal}
 */
// @ts-ignore
var strapi;

module.exports = (plugin) => {
  // Override the default user controller
  plugin.controllers.user = {
    ...plugin.controllers.user,
    
    async update(ctx) {
      try {
        console.log('🎯 CUSTOM CONTROLLER: update method called!');
        console.log('🔍 Request body:', ctx.request.body);
        console.log('🔍 Request body type:', typeof ctx.request.body);
        console.log('🔍 Request body keys:', Object.keys(ctx.request.body));
        console.log('🔍 Request files:', ctx.request.files);
        
        const { id } = ctx.params;
        const { data } = ctx.request.body;
        
        console.log('🔄 Updating user:', id, 'with data:', data);
        console.log('🔍 Data type:', typeof data);
        
        // Ensure the user can only update their own profile
        if (ctx.state.user && ctx.state.user.id !== parseInt(id)) {
          return ctx.forbidden('You can only update your own profile');
        }
        
        // Parse data if it's a string
        let updateData = data;
        if (typeof data === 'string') {
          try {
            updateData = JSON.parse(data);
          } catch (e) {
            console.error('❌ Error parsing data string:', e);
            return ctx.badRequest('Invalid data format');
          }
        }
        
        // Handle file uploads for profile image
        if (ctx.request.files && (ctx.request.files.profileImage || ctx.request.files['files.profileImage'])) {
          console.log('📸 Profile image upload detected');
          
          try {
            const file = ctx.request.files.profileImage || ctx.request.files['files.profileImage'];
            console.log('📁 File details:', {
              name: file.name,
              type: file.type,
              size: file.size
            });
            
            // Upload the file using Strapi's upload service
            const uploadedFile = await global.strapi.plugins.upload.services.upload.upload({
              data: {},
              files: file
            });
            
            console.log('✅ File uploaded successfully:', uploadedFile[0].id);
            
            // Set the profile image to the uploaded file
            updateData.profileImage = uploadedFile[0].id;
            console.log('🔍 Set profileImage to:', uploadedFile[0].id);
          } catch (uploadError) {
            console.error('❌ Error uploading file:', uploadError);
            return ctx.badRequest('Failed to upload profile image');
          }
        } else {
          console.log('🔍 No files in request or no profileImage file');
        }
        
        // Update the user
        console.log('🔄 Strapi entityService.update called with data:', updateData);
        
        const updatedUser = await global.strapi.entityService.update('plugin::users-permissions.user', id, {
          data: updateData,
          populate: ['role', 'profileImage']
        });
        
        console.log('✅ Strapi entityService.update result:', updatedUser);
        console.log('📍 Addresses in updatedUser:', updatedUser.addresses);
        console.log('🔍 Updated username:', updatedUser.username);
        console.log('🔍 Updated email:', updatedUser.email);
        console.log('🔍 Updated phone:', updatedUser.phone);
        console.log('🔍 Updated profileImage:', updatedUser.profileImage);
        
        // Sanitize the output to remove sensitive fields
        const sanitizedUser = {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          provider: updatedUser.provider,
          confirmed: updatedUser.confirmed,
          blocked: updatedUser.blocked,
          role: updatedUser.role,
          phone: updatedUser.phone,
          totalRewards: updatedUser.totalRewards,
          referralCount: updatedUser.referralCount,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        };
        
        console.log('📍 Addresses after sanitization:', sanitizedUser.addresses);
        
        // Ensure addresses and profileImage are included in the response
        const response = {
          id: sanitizedUser.id,
          username: sanitizedUser.username,
          email: sanitizedUser.email,
          provider: sanitizedUser.provider,
          confirmed: sanitizedUser.confirmed,
          blocked: sanitizedUser.blocked,
          role: sanitizedUser.role,
          addresses: updatedUser.addresses, // Include addresses directly
          profileImage: updatedUser.profileImage, // Include profile image
          notificationPreferences: updatedUser.notificationPreferences,
          fcmToken: updatedUser.fcmToken, // Include FCM token
          phone: sanitizedUser.phone,
          totalRewards: sanitizedUser.totalRewards,
          referralCount: sanitizedUser.referralCount,
          createdAt: sanitizedUser.createdAt,
          updatedAt: sanitizedUser.updatedAt
        };
        
        console.log('📍 Final response addresses:', response.addresses);
        console.log('📍 Final response profileImage:', response.profileImage);
        
        return response;
      } catch (error) {
        console.error('❌ Error updating user:', error);
        return ctx.internalServerError('Failed to update user profile');
      }
    },
    
    async me(ctx) {
      try {
        console.log('🎯 CUSTOM CONTROLLER: me method called!');
        
        const user = ctx.state.user;
        
        if (!user) {
          return ctx.unauthorized('Not authenticated');
        }
        
        // Get the full user data with populated fields
        console.log('🔄 Fetching user data for ID:', user.id);
        
        const fullUser = await global.strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
          populate: ['role', 'profileImage']
        });
        
        console.log('✅ Raw user data from database:', fullUser);
        console.log('📍 Addresses in raw data:', fullUser.addresses);
        console.log('📍 Profile image in raw data:', fullUser.profileImage);
        
        // Sanitize the output
        const sanitizedUser = {
          id: fullUser.id,
          username: fullUser.username,
          email: fullUser.email,
          provider: fullUser.provider,
          confirmed: fullUser.confirmed,
          blocked: fullUser.blocked,
          role: fullUser.role,
          phone: fullUser.phone,
          totalRewards: fullUser.totalRewards,
          referralCount: fullUser.referralCount,
          createdAt: fullUser.createdAt,
          updatedAt: fullUser.updatedAt
        };
        
        console.log('📍 Addresses after sanitization:', sanitizedUser.addresses);
        
        // Ensure addresses and profileImage are included in the response
        const response = {
          id: sanitizedUser.id,
          username: sanitizedUser.username,
          email: sanitizedUser.email,
          provider: sanitizedUser.provider,
          confirmed: sanitizedUser.confirmed,
          blocked: sanitizedUser.blocked,
          role: sanitizedUser.role,
          addresses: fullUser.addresses, // Include addresses directly
          profileImage: fullUser.profileImage, // Include profile image
          notificationPreferences: fullUser.notificationPreferences,
          fcmToken: fullUser.fcmToken, // Include FCM token
          phone: sanitizedUser.phone,
          totalRewards: sanitizedUser.totalRewards,
          referralCount: sanitizedUser.referralCount,
          createdAt: sanitizedUser.createdAt,
          updatedAt: sanitizedUser.updatedAt
        };
        
        console.log('📍 Final response addresses:', response.addresses);
        console.log('📍 Final response profileImage:', response.profileImage);
        
        return response;
      } catch (error) {
        console.error('❌ Error fetching current user:', error);
        return ctx.internalServerError('Failed to fetch user data');
      }
    }
  };

  // Add custom password change method to the existing auth controller
  if (plugin.controllers.auth) {
    // Add custom forgot password method
    plugin.controllers.auth.forgotPassword = async (ctx) => {
      try {
        const { email } = ctx.request.body;
        
        // Validate email input
        if (!email) {
          return ctx.badRequest({
            error: 'Email is required',
            message: 'Please provide a valid email address'
          });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return ctx.badRequest({
            error: 'Invalid email format',
            message: 'Please provide a valid email address'
          });
        }
        
        // Check if email service is configured
        const emailServiceType = process.env.EMAIL_SERVICE || 'gmail';
        let emailConfigured = false;
        
        switch (emailServiceType) {
          case 'gmail':
            emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
            break;
          case 'sendgrid':
            emailConfigured = !!process.env.SENDGRID_API_KEY;
            break;
          case 'ses':
            emailConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
            break;
          case 'custom':
            emailConfigured = !!(process.env.SMTP_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
            break;
          default:
            emailConfigured = false;
        }
        
        if (!emailConfigured) {
          return ctx.serviceUnavailable({
            error: 'Email service unavailable',
            message: 'Password reset service is temporarily unavailable. Please try again later or contact support.'
          });
        }
        
        // Find user by email
        let user;
        try {
          const users = await global.strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { email: email.toLowerCase().trim() },
            populate: ['role']
          });
          
          user = users[0];
        } catch (dbError) {
          return ctx.internalServerError({
            error: 'Database error',
            message: 'Unable to process request. Please try again later.'
          });
        }
        
        if (!user) {
          // Return success message even if user doesn't exist (security best practice)
          return {
            message: 'If an account exists with this email, you will receive a password reset code.',
            email: email
          };
        }
        
        // Generate OTP (6-digit code)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Update user with OTP
        try {
          await global.strapi.entityService.update('plugin::users-permissions.user', user.id, {
            data: {
              resetPasswordToken: otp
            }
          });
        } catch (updateError) {
          return ctx.internalServerError({
            error: 'Database update error',
            message: 'Unable to process password reset. Please try again later.'
          });
        }
        
        // Import email service
        let emailServiceModule;
        try {
          emailServiceModule = require('../../services/email');
        } catch (importError) {
          return ctx.internalServerError({
            error: 'Service unavailable',
            message: 'Email service is temporarily unavailable. Please try again later.'
          });
        }
        
        // Send OTP email
        let emailResult;
        try {
          emailResult = await emailServiceModule.sendPasswordResetOTP(email, otp);
        } catch (emailError) {
          return ctx.serviceUnavailable({
            error: 'Email delivery failed',
            message: 'Unable to send reset email. Please try again later or contact support.'
          });
        }
        
        if (!emailResult || !emailResult.success) {
          return ctx.serviceUnavailable({
            error: 'Email delivery failed',
            message: 'Unable to send reset email. Please try again later or contact support.'
          });
        }
        
        return {
          message: 'OTP sent successfully to your email address.',
          email: email
        };
        
      } catch (error) {
        // Log error for debugging but don't expose details to client
        console.error('Forgot password error:', error);
        
        return ctx.internalServerError({
          error: 'Internal server error',
          message: 'An unexpected error occurred. Please try again later or contact support if the problem persists.'
        });
      }
    };

    // Add custom reset password method
    plugin.controllers.auth.resetPassword = async (ctx) => {
      try {
        const { code, password, passwordConfirmation } = ctx.request.body;
        
        // Validate required fields
        if (!code || !password || !passwordConfirmation) {
          return ctx.badRequest({
            error: 'Missing required fields',
            message: 'OTP, password, and password confirmation are required'
          });
        }
        
        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(code)) {
          return ctx.badRequest({
            error: 'Invalid OTP format',
            message: 'OTP must be a 6-digit number'
          });
        }
        
        // Validate password confirmation
        if (password !== passwordConfirmation) {
          return ctx.badRequest({
            error: 'Passwords do not match',
            message: 'Password and confirmation must be identical'
          });
        }
        
        // Validate password strength
        if (password.length < 6) {
          return ctx.badRequest({
            error: 'Password too short',
            message: 'Password must be at least 6 characters long'
          });
        }
        
        if (password.length > 128) {
          return ctx.badRequest({
            error: 'Password too long',
            message: 'Password must be less than 128 characters'
          });
        }
        
        // Find user by OTP
        let users;
        try {
          users = await global.strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { resetPasswordToken: code },
            populate: ['role']
          });
        } catch (dbError) {
          return ctx.internalServerError({
            error: 'Database error',
            message: 'Unable to process request. Please try again later.'
          });
        }
        
        const targetUser = users[0];
        
        if (!targetUser) {
          return ctx.badRequest({
            error: 'Invalid OTP',
            message: 'Invalid or expired OTP. Please request a new password reset.'
          });
        }
        
        // Hash new password
        let hashedPassword;
        try {
          hashedPassword = await global.strapi.plugins['users-permissions'].services.user.hashPassword({
            password: password
          });
        } catch (hashError) {
          return ctx.internalServerError({
            error: 'Password processing error',
            message: 'Unable to process password. Please try again later.'
          });
        }
        
        // Update user with new password and clear OTP
        try {
          await global.strapi.entityService.update('plugin::users-permissions.user', targetUser.id, {
            data: {
              password: hashedPassword,
              resetPasswordToken: null
            }
          });
        } catch (updateError) {
          return ctx.internalServerError({
            error: 'Database update error',
            message: 'Unable to update password. Please try again later.'
          });
        }
        
        // Return success message
        return {
          message: 'Password reset successfully'
        };
        
      } catch (error) {
        // Log error for debugging but don't expose details to client
        console.error('Reset password error:', error);
        
        return ctx.internalServerError({
          error: 'Internal server error',
          message: 'An unexpected error occurred. Please try again later or contact support if the problem persists.'
        });
      }
    };

    plugin.controllers.auth.changePassword = async (ctx) => {
      try {
        const { currentPassword, password, passwordConfirmation } = ctx.request.body;
        const user = ctx.state.user;
        
        if (!user) {
          return ctx.unauthorized('Not authenticated');
        }
        
        if (!currentPassword || !password || !passwordConfirmation) {
          return ctx.badRequest('Current password, new password, and password confirmation are required');
        }
        
        if (password !== passwordConfirmation) {
          return ctx.badRequest('New password and confirmation do not match');
        }
        
        if (password.length < 6) {
          return ctx.badRequest('New password must be at least 6 characters long');
        }
        
        // Get the current user with password
        const currentUser = await global.strapi.entityService.findOne('plugin::users-permissions.user', user.id);
        
        // Verify current password
        const isValidPassword = await global.strapi.plugins['users-permissions'].services.user.validatePassword(
          currentPassword,
          currentUser.password
        );
        
        if (!isValidPassword) {
          return ctx.badRequest('Current password is incorrect');
        }
        
        // Hash the new password
        const hashedPassword = await global.strapi.plugins['users-permissions'].services.user.hashPassword({
          password: password
        });
        
        // Update the password
        await global.strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
            password: hashedPassword
          }
        });
        
        return {
          message: 'Password changed successfully'
        };
      } catch (error) {
        console.error('Change password error:', error);
        return ctx.internalServerError('Failed to change password');
      }
    };
  }

  // Add custom routes for password management
  plugin.routes['content-api'].routes.push(
    {
      method: 'POST',
      path: '/auth/forgot-password',
      handler: 'auth.forgotPassword',
      config: {
        auth: false // Public endpoint
      }
    },
    {
      method: 'POST',
      path: '/auth/reset-password',
      handler: 'auth.resetPassword',
      config: {
        auth: false // Public endpoint
      }
    },
    {
      method: 'POST',
      path: '/auth/change-password',
      handler: 'auth.changePassword',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  );





  return plugin;
}; 