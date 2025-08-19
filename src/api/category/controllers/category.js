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
  },

  // Override the delete method to ensure it works properly
  async delete(ctx) {
    const { id } = ctx.params;
    
    console.log('🔍 Product category delete request - ID:', id);
    console.log('🔍 ID type:', typeof id);
    console.log('🔍 User context:', ctx.state.user);
    
    try {
      // Validate ID format
      const categoryId = parseInt(id);
      if (isNaN(categoryId) || categoryId <= 0) {
        console.log('🔍 Invalid ID format:', id);
        return ctx.badRequest('Invalid category ID format');
      }
      
      console.log('🔍 Parsed category ID:', categoryId);
      
      // Check if the category exists
      const existingCategory = await strapi.entityService.findOne('api::category.category', categoryId);
      
      if (!existingCategory) {
        console.log('🔍 Category not found with ID:', categoryId);
        return ctx.notFound('Category not found');
      }
      
      console.log('🔍 Found category:', existingCategory.name);
      
      // Delete the category
      const deletedCategory = await strapi.entityService.delete('api::category.category', categoryId);
      
      console.log('🔍 Successfully deleted category:', deletedCategory.name);
      
      return ctx.send({ 
        message: 'Category deleted successfully',
        data: deletedCategory 
      });
    } catch (error) {
      console.error('🔍 Error deleting category:', error);
      console.error('🔍 Error details:', error.message);
      console.error('🔍 Error stack:', error.stack);
      return ctx.internalServerError('Failed to delete category');
    }
  }
}));
