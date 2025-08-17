'use strict';

/**
 *  category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::category.category', ({ strapi }) => ({
  // Override the findOne method to ensure it works properly
  async findOne(ctx) {
    const { id } = ctx.params;
    
    try {
      const category = await strapi.entityService.findOne('api::category.category', id, {
        populate: ['image', 'icon']
      });
      
      if (!category) {
        return ctx.notFound('Category not found');
      }
      
      return ctx.send({ data: category });
    } catch (error) {
      console.error('Error finding category:', error);
      return ctx.internalServerError('Failed to find category');
    }
  },

  // Override the update method to ensure it works properly
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    try {
      const category = await strapi.entityService.update('api::category.category', id, {
        data,
        populate: ['image', 'icon']
      });
      
      return ctx.send({ data: category });
    } catch (error) {
      console.error('Error updating category:', error);
      return ctx.internalServerError('Failed to update category');
    }
  }
}));
