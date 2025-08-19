'use strict';

/**
 * banner controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::banner.banner', ({ strapi }) => ({
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    console.log('Updating banner:', id, data);
    
    try {
      const entity = await strapi.entityService.update('api::banner.banner', id, {
        data: data,
      });
      
      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      console.error('Banner update error:', error);
      ctx.throw(500, error);
    }
  },
  
  async findOne(ctx) {
    const { id } = ctx.params;
    
    console.log('Finding banner:', id);
    
    try {
      const entity = await strapi.entityService.findOne('api::banner.banner', id);
      
      if (!entity) {
        return ctx.notFound('Banner not found');
      }
      
      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      console.error('Banner findOne error:', error);
      ctx.throw(500, error);
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;
    
    console.log('🔍 Deleting banner with ID:', id);
    console.log('🔍 User context:', ctx.state.user?.id, ctx.state.user?.username);
    
    try {
      // First check if banner exists
      const existingBanner = await strapi.entityService.findOne('api::banner.banner', id);
      
      if (!existingBanner) {
        console.log('🔍 Banner not found for deletion:', id);
        return ctx.notFound('Banner not found');
      }
      
      console.log('🔍 Found banner to delete:', existingBanner.title, existingBanner.id);
      
      // Delete the banner
      const deletedBanner = await strapi.entityService.delete('api::banner.banner', id);
      
      console.log('🔍 Banner deleted successfully:', deletedBanner.id);
      
      const sanitizedEntity = await this.sanitizeOutput(deletedBanner, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      console.error('🔍 Banner delete error:', error);
      console.error('🔍 Error details:', error.message, error.stack);
      ctx.throw(500, `Failed to delete banner: ${error.message}`);
    }
  }
})); 