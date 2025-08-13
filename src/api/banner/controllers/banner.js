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
  }
})); 