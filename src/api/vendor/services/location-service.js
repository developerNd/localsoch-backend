/**
 * Location Service for Vendors
 * Handles location updates and nearby seller calculations
 */

const locationUtils = require('../../../utils/locationUtils');

module.exports = ({ strapi }) => ({
  /**
   * Update vendor location and related data
   * @param {number} vendorId - Vendor ID
   * @param {object} locationData - Location data from GPS
   * @returns {object} Updated vendor data
   */
  async updateVendorLocation(vendorId, locationData) {
    try {
      const { latitude, longitude, accuracy, address, city, state, pincode } = locationData;
      
      // Validate coordinates
      if (!locationUtils.isValidCoordinates(latitude, longitude)) {
        throw new Error('Invalid GPS coordinates');
      }
      
      // Update vendor with new location data
      const updatedVendor = await strapi.entityService.update('api::vendor.vendor', vendorId, {
        data: {
          latitude,
          longitude,
          locationAccuracy: accuracy,
          gpsAddress: address,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          locationUpdatedAt: new Date(),
          lastActiveAt: new Date()
        },
        populate: ['businessCategory', 'shopHours', 'deliveryFees']
      });
      
      // Log location update
      strapi.log.info(`📍 Vendor ${vendorId} location updated: ${latitude}, ${longitude}`);
      
      return updatedVendor;
      
    } catch (error) {
      strapi.log.error('Error updating vendor location:', error);
      throw error;
    }
  },
  
  /**
   * Get nearby vendors for a given location
   * @param {number} latitude - User latitude
   * @param {number} longitude - User longitude
   * @param {number} radius - Search radius in km
   * @param {object} filters - Additional filters
   * @returns {array} Array of nearby vendors with distance
   */
  async getNearbyVendors(latitude, longitude, radius = 10, filters = {}) {
    try {
      // Validate coordinates
      if (!locationUtils.isValidCoordinates(latitude, longitude)) {
        throw new Error('Invalid coordinates');
      }
      
      // Get bounding box for efficient query
      const boundingBox = locationUtils.getBoundingBox(latitude, longitude, radius);
      
      // Build query filters
      const queryFilters = {
        latitude: {
          $gte: boundingBox.minLat,
          $lte: boundingBox.maxLat
        },
        longitude: {
          $gte: boundingBox.minLon,
          $lte: boundingBox.maxLon
        },
        isActive: true,
        isApproved: true,
        ...filters
      };
      
      // Query vendors
      const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
        filters: queryFilters,
        populate: ['businessCategory', 'shopHours', 'deliveryFees', 'profileImage'],
        limit: 100 // Get more to filter by distance
      });
      
      // Calculate distances and filter
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
          if (distance > radius) return null;
          
          return {
            ...vendor,
            distance,
            distanceFormatted: locationUtils.formatDistance(distance),
            vendorScore: locationUtils.calculateVendorScore(vendor, distance),
            isCurrentlyOpen: locationUtils.isVendorOpen(vendor.shopHours)
          };
        })
        .filter(vendor => vendor !== null)
        .sort((a, b) => a.distance - b.distance);
      
      return nearbyVendors;
      
    } catch (error) {
      strapi.log.error('Error getting nearby vendors:', error);
      throw error;
    }
  },
  
  /**
   * Update vendor activity status
   * @param {number} vendorId - Vendor ID
   * @param {boolean} isOnline - Online status
   * @param {boolean} isOpen - Open status
   */
  async updateVendorStatus(vendorId, isOnline = true, isOpen = true) {
    try {
      await strapi.entityService.update('api::vendor.vendor', vendorId, {
        data: {
          isOnline,
          isOpen,
          lastActiveAt: new Date()
        }
      });
      
      strapi.log.info(`📊 Vendor ${vendorId} status updated: online=${isOnline}, open=${isOpen}`);
      
    } catch (error) {
      strapi.log.error('Error updating vendor status:', error);
      throw error;
    }
  },
  
  
  /**
   * Get vendor location analytics
   * @param {number} vendorId - Vendor ID
   * @returns {object} Location analytics data
   */
  async getVendorLocationAnalytics(vendorId) {
    try {
      const vendor = await strapi.entityService.findOne('api::vendor.vendor', vendorId, {
        populate: ['businessCategory', 'shopHours', 'deliveryFees']
      });
      
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      
      if (!vendor.latitude || !vendor.longitude) {
        return {
          hasLocation: false,
          message: 'Vendor location not set'
        };
      }
      
      // Get nearby vendors for comparison
      const nearbyVendors = await this.getNearbyVendors(
        vendor.latitude, 
        vendor.longitude, 
        vendor.deliveryFees?.deliveryRadius || 10
      );
      
      return {
        hasLocation: true,
        coordinates: {
          latitude: vendor.latitude,
          longitude: vendor.longitude,
          accuracy: vendor.locationAccuracy
        },
        address: vendor.gpsAddress,
        serviceRadius: vendor.deliveryFees?.deliveryRadius || 10,
        nearbyVendorsCount: nearbyVendors.length,
        isCurrentlyOpen: locationUtils.isVendorOpen(vendor.shopHours),
        locationUpdatedAt: vendor.locationUpdatedAt,
        lastActiveAt: vendor.lastActiveAt
      };
      
    } catch (error) {
      strapi.log.error('Error getting vendor location analytics:', error);
      throw error;
    }
  }
});
