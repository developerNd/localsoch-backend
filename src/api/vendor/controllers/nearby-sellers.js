/**
 * Nearby Sellers API Controller
 * Handles location-based vendor searches and recommendations
 */

const { createCoreController } = require('@strapi/strapi').factories;
const locationUtils = require('../../../utils/locationUtils');

module.exports = createCoreController('api::vendor.vendor', ({ strapi }) => ({
  /**
   * Find nearby sellers based on user location
   * GET /api/vendors/nearby?lat=20.475&lng=82.076&radius=10&category=grocery
   */
  async findNearby(ctx) {
    try {
      const { lat, lng, radius = 10, category, isOpen, limit = 20, sortBy = 'distance' } = ctx.query;
      
      // Validate coordinates
      if (!lat || !lng) {
        return ctx.badRequest('Latitude and longitude are required');
      }
      
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const searchRadius = parseFloat(radius);
      
      if (!locationUtils.isValidCoordinates(latitude, longitude)) {
        return ctx.badRequest('Invalid coordinates');
      }
      
      // Get bounding box for efficient database query
      const boundingBox = locationUtils.getBoundingBox(latitude, longitude, searchRadius);
      
      // Build query filters
      const filters = {
        latitude: {
          $gte: boundingBox.minLat,
          $lte: boundingBox.maxLat
        },
        longitude: {
          $gte: boundingBox.minLon,
          $lte: boundingBox.maxLon
        },
        isActive: true,
        isApproved: true
      };
      
      // Add category filter if specified
      if (category) {
        filters.businessCategory = category;
      }
      
      // Add open status filter if specified
      if (isOpen === 'true') {
        filters.isOpen = true;
        filters.isOnline = true;
      }
      
      // Query vendors
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        filters,
        populate: [
          'businessCategory',
          'shopHours',
          'deliveryFees',
          'profileImage',
          'user'
        ],
        limit: parseInt(limit) * 2, // Get more to filter by distance
        sort: { rating: 'desc' }
      });
      
      // Calculate distances and filter by actual distance
      const nearbyVendors = vendors
        .map(vendor => {
          if (!vendor.latitude || !vendor.longitude) return null;
          
          const distance = locationUtils.calculateDistance(
            latitude, longitude, 
            vendor.latitude, vendor.longitude
          );
          
          // Check if within service radius
          const serviceRadius = vendor.deliveryFees?.deliveryRadius || 10;
          if (distance > serviceRadius) return null;
          
          // Check if within search radius
          if (distance > searchRadius) return null;
          
          // Check if currently open
          if (isOpen === 'true' && !locationUtils.isVendorOpen(vendor.shopHours)) {
            return null;
          }
          
          return {
            ...vendor,
            distance,
            distanceFormatted: locationUtils.formatDistance(distance),
            vendorScore: locationUtils.calculateVendorScore(vendor, distance),
            isCurrentlyOpen: locationUtils.isVendorOpen(vendor.shopHours)
          };
        })
        .filter(vendor => vendor !== null)
        .slice(0, parseInt(limit));
      
      // Sort results
      if (sortBy === 'distance') {
        nearbyVendors.sort((a, b) => a.distance - b.distance);
      } else if (sortBy === 'rating') {
        nearbyVendors.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'score') {
        nearbyVendors.sort((a, b) => b.vendorScore - a.vendorScore);
      }
      
      // Add metadata
      const response = {
        data: nearbyVendors,
        meta: {
          total: nearbyVendors.length,
          userLocation: { latitude, longitude },
          searchRadius,
          filters: { category, isOpen },
          sortBy
        }
      };
      
      return ctx.send(response);
      
    } catch (error) {
      strapi.log.error('Error finding nearby sellers:', error);
      return ctx.internalServerError('Failed to find nearby sellers');
    }
  },
  
  /**
   * Get vendor details with distance from user
   * GET /api/vendors/nearby/:id?user_lat=20.475&user_lng=82.076
   */
  async getVendorWithDistance(ctx) {
    try {
      const { id } = ctx.params;
      const { user_lat, user_lng } = ctx.query;
      
      if (!user_lat || !user_lng) {
        return ctx.badRequest('User coordinates are required');
      }
      
      const userLat = parseFloat(user_lat);
      const userLng = parseFloat(user_lng);
      
      if (!locationUtils.isValidCoordinates(userLat, userLng)) {
        return ctx.badRequest('Invalid user coordinates');
      }
      
      // Get vendor with full details
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', id, {
        populate: [
          'businessCategory',
          'shopHours',
          'deliveryFees',
          'profileImage',
          'user',
          'products',
          'socialMedia',
          'businessDocuments'
        ]
      });
      
      if (!vendor) {
        return ctx.notFound('Vendor not found');
      }
      
      if (!vendor.latitude || !vendor.longitude) {
        return ctx.badRequest('Vendor location not available');
      }
      
      // Calculate distance
      const distance = locationUtils.calculateDistance(
        userLat, userLng,
        vendor.latitude, vendor.longitude
      );
      
      // Check if within service radius
      const serviceRadius = vendor.deliveryFees?.deliveryRadius || 10;
      const isWithinService = distance <= serviceRadius;
      
      // Add location data
      const vendorWithDistance = {
        ...vendor,
        distance,
        distanceFormatted: locationUtils.formatDistance(distance),
        isWithinService,
        isCurrentlyOpen: locationUtils.isVendorOpen(vendor.shopHours),
        vendorScore: locationUtils.calculateVendorScore(vendor, distance)
      };
      
      return ctx.send({ data: vendorWithDistance });
      
    } catch (error) {
      strapi.log.error('Error getting vendor with distance:', error);
      return ctx.internalServerError('Failed to get vendor details');
    }
  },
  
  /**
   * Simple vendor search with basic filters
   * GET /api/vendors/search?lat=20.475&lng=82.076&radius=5&category=vegetables&is_open=true
   */
  async searchVendors(ctx) {
    try {
      const { 
        lat, lng, radius = 10, category, isOpen, 
        limit = 20, sortBy = 'distance'
      } = ctx.query;
      
      // Validate coordinates
      if (!lat || !lng) {
        return ctx.badRequest('Latitude and longitude are required');
      }
      
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (!locationUtils.isValidCoordinates(latitude, longitude)) {
        return ctx.badRequest('Invalid coordinates');
      }
      
      // Build basic filters
      const filters = {
        latitude: { $gte: latitude - 0.1, $lte: latitude + 0.1 },
        longitude: { $gte: longitude - 0.1, $lte: longitude + 0.1 },
        isActive: true,
        isApproved: true
      };
      
      // Add basic filters
      if (category) filters.businessCategory = category;
      if (isOpen === 'true') {
        filters.isOpen = true;
        filters.isOnline = true;
      }
      
      // Query vendors
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        filters,
        populate: [
          'businessCategory',
          'shopHours',
          'deliveryFees',
          'profileImage'
        ],
        limit: parseInt(limit) * 2
      });
      
      // Calculate distances and filter
      const searchResults = vendors
        .map(vendor => {
          if (!vendor.latitude || !vendor.longitude) return null;
          
          const distance = locationUtils.calculateDistance(
            latitude, longitude,
            vendor.latitude, vendor.longitude
          );
          
          // Apply service radius filter
          const serviceRadius = vendor.deliveryFees?.deliveryRadius || 10;
          if (distance > serviceRadius) return null;
          
          // Apply search radius filter
          if (distance > parseFloat(radius)) return null;
          
          return {
            ...vendor,
            distance,
            distanceFormatted: locationUtils.formatDistance(distance),
            isCurrentlyOpen: locationUtils.isVendorOpen(vendor.shopHours)
          };
        })
        .filter(vendor => vendor !== null)
        .slice(0, parseInt(limit));
      
      // Sort results
      if (sortBy === 'distance') {
        searchResults.sort((a, b) => a.distance - b.distance);
      } else if (sortBy === 'rating') {
        searchResults.sort((a, b) => b.rating - a.rating);
      }
      
      return ctx.send({
        data: searchResults,
        meta: {
          total: searchResults.length,
          userLocation: { latitude, longitude },
          filters: { category, isOpen },
          sortBy
        }
      });
      
    } catch (error) {
      strapi.log.error('Error searching vendors:', error);
      return ctx.internalServerError('Failed to search vendors');
    }
  }
}));
