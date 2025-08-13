'use strict';

/**
 * featured-product service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::featured-product.featured-product', ({ strapi }) => ({
  async getActiveFeaturedProducts() {
    const filters = {
      isActive: true,
      $and: [
        {
          $or: [
            {
              startDate: { $lte: new Date() }
            },
            {
              startDate: null
            }
          ]
        },
        {
          $or: [
            {
              endDate: { $gte: new Date() }
            },
            {
              endDate: null
            }
          ]
        }
      ]
    };

    return await strapi.entityService.findMany('api::featured-product.featured-product', {
      filters,
      sort: { sortOrder: 'asc', createdAt: 'desc' },
      populate: ['product', 'product.image', 'product.category', 'product.vendor', 'customImage']
    });
  },

  async getFeaturedProductsByType(type, limit = 10) {
    const filters = {
      isActive: true,
      featuredType: type,
      $and: [
        {
          $or: [
            {
              startDate: { $lte: new Date() }
            },
            {
              startDate: null
            }
          ]
        },
        {
          $or: [
            {
              endDate: { $gte: new Date() }
            },
            {
              endDate: null
            }
          ]
        }
      ]
    };

    return await strapi.entityService.findMany('api::featured-product.featured-product', {
      filters,
      sort: { sortOrder: 'asc', createdAt: 'desc' },
      populate: ['product', 'product.image', 'product.category', 'product.vendor', 'customImage'],
      pagination: {
        limit
      }
    });
  },

  async getFeaturedProductsForHome(limit = 20) {
    const filters = {
      isActive: true,
      $and: [
        {
          $or: [
            {
              startDate: { $lte: new Date() }
            },
            {
              startDate: null
            }
          ]
        },
        {
          $or: [
            {
              endDate: { $gte: new Date() }
            },
            {
              endDate: null
            }
          ]
        }
      ]
    };

    return await strapi.entityService.findMany('api::featured-product.featured-product', {
      filters,
      sort: { sortOrder: 'asc', createdAt: 'desc' },
      populate: ['product', 'product.image', 'product.category', 'product.vendor', 'customImage'],
      pagination: {
        limit
      }
    });
  }
})); 