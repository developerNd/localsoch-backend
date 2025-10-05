'use strict';

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
            const uploadedFile = await strapi.plugins.upload.services.upload.upload({
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
        
        const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', id, {
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
        
        const fullUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
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
      console.log('🎯🎯🎯 CUSTOM AUTH CONTROLLER: forgotPassword method called! 🎯🎯🎯');
      
      try {
        const { email } = ctx.request.body;
        
        if (!email) {
          return ctx.badRequest('Email is required');
        }
        
        // Simple test - just return success for now
        return {
          message: 'Test: OTP sent successfully to your email address.',
          email: email
        };
        
      } catch (error) {
        console.error('❌ Error in forgot password:', error);
        return ctx.internalServerError('Failed to process password reset request');
      }
    };

    // Add custom reset password method
    plugin.controllers.auth.resetPassword = async (ctx) => {
      try {
        console.log('🎯 CUSTOM AUTH CONTROLLER: resetPassword method called!');
        console.log('🔍 Request body:', ctx.request.body);
        
        const { code, password, passwordConfirmation } = ctx.request.body;
        
        if (!code || !password || !passwordConfirmation) {
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
          filters: { resetPasswordToken: code },
          populate: ['role']
        });
        
        const targetUser = user[0];
        
        if (!targetUser) {
          return ctx.badRequest('Invalid or expired OTP');
        }
        
        console.log('✅ User found with OTP:', { id: targetUser.id, email: targetUser.email });
        
        // Hash new password
        const hashedPassword = await strapi.plugins['users-permissions'].services.user.hashPassword({
          password: password
        });
        
        // Update user with new password and clear OTP
        await strapi.entityService.update('plugin::users-permissions.user', targetUser.id, {
          data: {
            password: hashedPassword,
            resetPasswordToken: null
          }
        });
        
        console.log('✅ Password reset successfully for user:', targetUser.email);
        
        // Return success message
        return {
          message: 'Password reset successfully'
        };
        
      } catch (error) {
        console.error('❌ Error in reset password:', error);
        return ctx.internalServerError('Failed to reset password');
      }
    };

    plugin.controllers.auth.changePassword = async (ctx) => {
      try {
        console.log('🎯 CUSTOM AUTH CONTROLLER: changePassword method called!');
        console.log('🔍 Request body:', ctx.request.body);
        console.log('🔍 User:', ctx.state.user);
        
        const { currentPassword, password, passwordConfirmation } = ctx.request.body;
        const user = ctx.state.user;
        
        if (!user) {
          console.log('❌ No user found in ctx.state.user');
          return ctx.unauthorized('Not authenticated');
        }
        
        if (!currentPassword || !password || !passwordConfirmation) {
          console.log('❌ Missing password fields:', { 
            currentPassword: !!currentPassword, 
            password: !!password, 
            passwordConfirmation: !!passwordConfirmation 
          });
          return ctx.badRequest('Current password, new password, and password confirmation are required');
        }
        
        if (password !== passwordConfirmation) {
          console.log('❌ Passwords do not match');
          return ctx.badRequest('New password and confirmation do not match');
        }
        
        if (password.length < 6) {
          console.log('❌ Password too short:', password.length);
          return ctx.badRequest('New password must be at least 6 characters long');
        }
        
        // Get the current user with password
        console.log('🔍 Fetching current user data...');
        const currentUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id);
        console.log('✅ Current user fetched:', { id: currentUser.id, email: currentUser.email });
        
        // Verify current password
        console.log('🔍 Verifying current password...');
        const isValidPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(
          currentPassword,
          currentUser.password
        );
        
        if (!isValidPassword) {
          console.log('❌ Current password is incorrect');
          return ctx.badRequest('Current password is incorrect');
        }
        console.log('✅ Current password verified');
        
        // Hash the new password
        console.log('🔍 Hashing new password...');
        const hashedPassword = await strapi.plugins['users-permissions'].services.user.hashPassword({
          password: password
        });
        console.log('✅ Password hashed successfully');
        
        // Update the password
        console.log('🔍 Updating user password...');
        try {
          await strapi.entityService.update('plugin::users-permissions.user', user.id, {
            data: {
              password: hashedPassword
            }
          });
          console.log('✅ Password updated successfully');
        } catch (updateError) {
          console.error('❌ Error updating password:', updateError);
          throw updateError;
        }
        
        console.log('✅ Password changed successfully for user:', user.id);
        
        return {
          message: 'Password changed successfully'
        };
      } catch (error) {
        console.error('❌ Error changing password:', error);
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