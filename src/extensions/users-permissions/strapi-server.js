'use strict';

module.exports = (plugin) => {
  // Override the default user controller
  plugin.controllers.user = {
    ...plugin.controllers.user,
    
    async update(ctx) {
      try {
        console.log('🎯 CUSTOM CONTROLLER: update method called!');
        
        const { id } = ctx.params;
        const { data } = ctx.request.body;
        
        console.log('🔄 Updating user:', id, 'with data:', data);
        
        // Ensure the user can only update their own profile
        if (ctx.state.user && ctx.state.user.id !== parseInt(id)) {
          return ctx.forbidden('You can only update your own profile');
        }
        
        // Update the user
        console.log('🔄 Strapi entityService.update called with data:', data);
        
        const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', id, {
          data: data,
          populate: ['role']
        });
        
        console.log('✅ Strapi entityService.update result:', updatedUser);
        console.log('📍 Addresses in updatedUser:', updatedUser.addresses);
        
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
        
        // Ensure addresses are included in the response
        const response = {
          id: sanitizedUser.id,
          username: sanitizedUser.username,
          email: sanitizedUser.email,
          provider: sanitizedUser.provider,
          confirmed: sanitizedUser.confirmed,
          blocked: sanitizedUser.blocked,
          role: sanitizedUser.role,
          addresses: updatedUser.addresses, // Include addresses directly
          notificationPreferences: updatedUser.notificationPreferences,
          phone: sanitizedUser.phone,
          totalRewards: sanitizedUser.totalRewards,
          referralCount: sanitizedUser.referralCount,
          createdAt: sanitizedUser.createdAt,
          updatedAt: sanitizedUser.updatedAt
        };
        
        console.log('📍 Final response addresses:', response.addresses);
        
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
          populate: ['role']
        });
        
        console.log('✅ Raw user data from database:', fullUser);
        console.log('📍 Addresses in raw data:', fullUser.addresses);
        
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
        
        // Ensure addresses are included in the response
        const response = {
          id: sanitizedUser.id,
          username: sanitizedUser.username,
          email: sanitizedUser.email,
          provider: sanitizedUser.provider,
          confirmed: sanitizedUser.confirmed,
          blocked: sanitizedUser.blocked,
          role: sanitizedUser.role,
          addresses: fullUser.addresses, // Include addresses directly
          notificationPreferences: fullUser.notificationPreferences,
          phone: sanitizedUser.phone,
          totalRewards: sanitizedUser.totalRewards,
          referralCount: sanitizedUser.referralCount,
          createdAt: sanitizedUser.createdAt,
          updatedAt: sanitizedUser.updatedAt
        };
        
        console.log('📍 Final response addresses:', response.addresses);
        
        return response;
      } catch (error) {
        console.error('❌ Error fetching current user:', error);
        return ctx.internalServerError('Failed to fetch user data');
      }
    }
  };

  return plugin;
}; 