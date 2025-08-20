'use strict';

/**
 * business-category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::business-category.business-category', ({ strapi }) => ({
  // Custom controller methods can be added here if needed
  
  async find(ctx) {
    // Get all business categories, ordered by sortOrder
    const { data, meta } = await super.find(ctx);
    
    // Sort by sortOrder if not already sorted
    if (data && data.length > 0) {
      data.sort((a, b) => {
        const aSortOrder = a?.attributes?.sortOrder ?? 0;
        const bSortOrder = b?.attributes?.sortOrder ?? 0;
        return aSortOrder - bSortOrder;
      });
    }
    
    return { data, meta };
  },
  
  async findActive(ctx) {
    // Get only active business categories
    const { data, meta } = await super.find({
      ...ctx,
      query: {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          isActive: true
        }
      }
    });
    
    // Sort by sortOrder
    if (data && data.length > 0) {
      data.sort((a, b) => {
        const aSortOrder = a?.attributes?.sortOrder ?? 0;
        const bSortOrder = b?.attributes?.sortOrder ?? 0;
        return aSortOrder - bSortOrder;
      });
    }
    
    return { data, meta };
  },

  // Override the findOne method to ensure it works properly
  async findOne(ctx) {
    const { id } = ctx.params;
    
    try {
      const category = await strapi.entityService.findOne('api::business-category.business-category', id, {
        populate: ['image']
      });
      
      if (!category) {
        return ctx.notFound('Business category not found');
      }
      
      return ctx.send({ data: category });
    } catch (error) {
      console.error('Error finding business category:', error);
      return ctx.internalServerError('Failed to find business category');
    }
  },

  // Override the update method to ensure it works properly
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    try {
      const category = await strapi.entityService.update('api::business-category.business-category', id, {
        data,
        populate: ['image']
      });
      
      return ctx.send({ data: category });
    } catch (error) {
      console.error('Error updating business category:', error);
      return ctx.internalServerError('Failed to update business category');
    }
  },

  // Override the create method to ensure it works properly
  async create(ctx) {
    const { data } = ctx.request.body;
    
    try {
      const category = await strapi.entityService.create('api::business-category.business-category', {
        data,
        populate: ['image']
      });
      
      return ctx.send({ data: category });
    } catch (error) {
      console.error('Error creating business category:', error);
      return ctx.internalServerError('Failed to create business category');
    }
  },

  // Override the delete method to ensure it works properly
  async delete(ctx) {
    const { id } = ctx.params;
    
    console.log('🔍 Business category delete request - ID:', id);
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
      
      // Check if the business category exists
      const existingCategory = await strapi.entityService.findOne('api::business-category.business-category', categoryId);
      
      if (!existingCategory) {
        console.log('🔍 Business category not found with ID:', categoryId);
        return ctx.notFound('Business category not found');
      }
      
      console.log('🔍 Found business category:', existingCategory.name);
      
      // Delete the business category
      const deletedCategory = await strapi.entityService.delete('api::business-category.business-category', categoryId);
      
      console.log('🔍 Successfully deleted business category:', deletedCategory.name);
      
      return ctx.send({ 
        message: 'Business category deleted successfully',
        data: deletedCategory 
      });
    } catch (error) {
      console.error('🔍 Error deleting business category:', error);
      console.error('🔍 Error details:', error.message);
      console.error('🔍 Error stack:', error.stack);
      return ctx.internalServerError('Failed to delete business category');
    }
  },

  // Custom method to create business categories from signup
  async createCustom(ctx) {
    const { name, description } = ctx.request.body;
    
    if (!name) {
      return ctx.badRequest('Business category name is required');
    }
    
    try {
      // Check if category already exists
      const existingCategory = await strapi.entityService.findMany('api::business-category.business-category', {
        filters: {
          name: {
            $eqi: name // Case-insensitive comparison
          }
        }
      });
      
      if (existingCategory && existingCategory.length > 0) {
        // Return existing category
        return ctx.send({ 
          data: existingCategory[0],
          message: 'Business category already exists'
        });
      }
      
      // Create new custom business category
      const category = await strapi.entityService.create('api::business-category.business-category', {
        data: {
          name: name,
          description: description || `Custom business category: ${name}`,
          isActive: true,
          sortOrder: 999, // Place at the end
          isCustom: true // Mark as custom category
        },
        populate: ['image']
      });
      
      console.log('🔍 Created custom business category:', category.name);
      
      return ctx.send({ 
        data: category,
        message: 'Custom business category created successfully'
      });
    } catch (error) {
      console.error('Error creating custom business category:', error);
      return ctx.internalServerError('Failed to create custom business category');
    }
  }
})); 