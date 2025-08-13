'use strict';

/**
 * banner service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::banner.banner', ({ strapi }) => ({
  async getActiveBanners() {
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

    return await strapi.entityService.findMany('api::banner.banner', {
      filters,
      sort: { sortOrder: 'asc', createdAt: 'desc' },
      populate: ['image']
    });
  },

  async getBannersForHome(limit = 5) {
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

    return await strapi.entityService.findMany('api::banner.banner', {
      filters,
      sort: { sortOrder: 'asc', createdAt: 'desc' },
      populate: ['image'],
      pagination: {
        limit
      }
    });
  }
})); 