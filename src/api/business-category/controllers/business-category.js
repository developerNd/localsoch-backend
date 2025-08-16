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
  }
})); 