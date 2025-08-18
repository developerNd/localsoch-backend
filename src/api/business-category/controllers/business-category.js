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
  }
})); 