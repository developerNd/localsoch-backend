'use strict';

/**
 * Location-based vendor controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::vendor.vendor', ({ strapi }) => ({
  // Get nearby vendors based on GPS coordinates
  async nearby(ctx) {
    try {
      const { latitude, longitude, radius = 10, category, search, limit = 20 } = ctx.query;
      
      // Validate required parameters
      if (!latitude || !longitude) {
        return ctx.badRequest('Latitude and longitude are required');
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radiusKm = parseFloat(radius);
      const limitNum = parseInt(limit);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return ctx.badRequest('Invalid coordinates');
      }

      // Build query filters
      const filters = {
        isActive: { $eq: true },
        latitude: { $notNull: true },
        longitude: { $notNull: true }
      };

      // Add category filter if provided
      if (category) {
        filters.businessCategory = { name: { $containsi: category } };
      }

      // Add search filter if provided
      if (search) {
        filters.$or = [
          { name: { $containsi: search } },
          { address: { $containsi: search } },
          { city: { $containsi: search } },
          { state: { $containsi: search } }
        ];
      }

      // Get all vendors with location data
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        filters,
        populate: {
          businessCategory: true,
          user: {
            populate: {
              role: true
            }
          }
        },
        limit: 1000 // Get more vendors to filter by distance
      });

      // Calculate distances and filter by radius
      const nearbyVendors = vendors
        .filter(vendor => vendor.latitude && vendor.longitude)
        .map(vendor => {
          const distance = calculateDistance(lat, lon, vendor.latitude, vendor.longitude);
          return {
            ...vendor,
            distance: distance
          };
        })
        .filter(vendor => vendor.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limitNum);

      // Transform response
      const transformedVendors = nearbyVendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        pincode: vendor.pincode,
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        distance: vendor.distance,
        isActive: vendor.isActive,
        businessCategory: vendor.businessCategory?.name || '',
        phone: vendor.phone,
        email: vendor.email,
        rating: vendor.rating || 0,
        reviewCount: vendor.reviewCount || 0,
        isOpen: vendor.isOpen || true,
        openingHours: vendor.openingHours || '',
        user: {
          id: vendor.user?.id,
          username: vendor.user?.username,
          email: vendor.user?.email,
          role: vendor.user?.role?.name || vendor.user?.role
        }
      }));

      return {
        data: transformedVendors,
        meta: {
          total: transformedVendors.length,
          radius: radiusKm,
          center: { latitude: lat, longitude: lon }
        }
      };

    } catch (error) {
      console.error('Error fetching nearby vendors:', error);
      return ctx.internalServerError('Failed to fetch nearby vendors');
    }
  },

  // Search vendors by location (city/state)
  async search(ctx) {
    try {
      const { city, state, category, search, limit = 20 } = ctx.query;
      const limitNum = parseInt(limit);

      // Build query filters
      const filters = {
        isActive: { $eq: true }
      };

      // Add location filters
      if (city) {
        filters.city = { $containsi: city };
      }
      if (state) {
        filters.state = { $containsi: state };
      }

      // Add category filter if provided
      if (category) {
        filters.businessCategory = { name: { $containsi: category } };
      }

      // Add search filter if provided
      if (search) {
        filters.$or = [
          { name: { $containsi: search } },
          { address: { $containsi: search } },
          { city: { $containsi: search } },
          { state: { $containsi: search } }
        ];
      }

      // Get vendors
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        filters,
        populate: {
          businessCategory: true,
          user: {
            populate: {
              role: true
            }
          }
        },
        limit: limitNum,
        sort: { name: 'asc' }
      });

      // Transform response
      const transformedVendors = vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        pincode: vendor.pincode,
        latitude: vendor.latitude || 0,
        longitude: vendor.longitude || 0,
        isActive: vendor.isActive,
        businessCategory: vendor.businessCategory?.name || '',
        phone: vendor.phone,
        email: vendor.email,
        rating: vendor.rating || 0,
        reviewCount: vendor.reviewCount || 0,
        isOpen: vendor.isOpen || true,
        openingHours: vendor.openingHours || '',
        user: {
          id: vendor.user?.id,
          username: vendor.user?.username,
          email: vendor.user?.email,
          role: vendor.user?.role?.name || vendor.user?.role
        }
      }));

      return {
        data: transformedVendors,
        meta: {
          total: transformedVendors.length,
          filters: { city, state, category, search }
        }
      };

    } catch (error) {
      console.error('Error searching vendors:', error);
      return ctx.internalServerError('Failed to search vendors');
    }
  }
}));

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

// Convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
