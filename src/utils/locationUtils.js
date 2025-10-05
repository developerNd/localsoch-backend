/**
 * Location utilities for nearby sellers feature
 * Includes distance calculations, location validation, and search helpers
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate distance in meters
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  return calculateDistance(lat1, lon1, lat2, lon2) * 1000;
}

/**
 * Validate GPS coordinates
 * @param {number} latitude - Latitude to validate
 * @param {number} longitude - Longitude to validate
 * @returns {boolean} True if coordinates are valid
 */
function isValidCoordinates(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180 &&
    !isNaN(latitude) && !isNaN(longitude)
  );
}

/**
 * Check if a vendor is within service radius
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} vendorLat - Vendor's latitude
 * @param {number} vendorLon - Vendor's longitude
 * @param {number} serviceRadius - Vendor's service radius in km
 * @returns {boolean} True if vendor is within service radius
 */
function isWithinServiceRadius(userLat, userLon, vendorLat, vendorLon, serviceRadius) {
  if (!isValidCoordinates(userLat, userLon) || !isValidCoordinates(vendorLat, vendorLon)) {
    return false;
  }
  
  const distance = calculateDistance(userLat, userLon, vendorLat, vendorLon);
  return distance <= serviceRadius;
}

/**
 * Get bounding box for location-based queries
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {object} Bounding box coordinates
 */
function getBoundingBox(latitude, longitude, radiusKm) {
  const earthRadius = 6371; // Earth's radius in km
  const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
  const lonDelta = (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);
  
  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta
  };
}

/**
 * Check if vendor is currently open based on business hours
 * @param {object} shopHours - Vendor's shop hours
 * @param {string} timezone - Vendor's timezone
 * @returns {boolean} True if vendor is currently open
 */
function isVendorOpen(shopHours, timezone = 'Asia/Kolkata') {
  if (!shopHours) return true; // Default to open if no hours specified
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase', timeZone: timezone });
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: timezone 
  });
  
  const dayHours = shopHours[currentDay];
  if (!dayHours || !dayHours.isOpen) return false;
  
  if (!dayHours.openTime || !dayHours.closeTime) return true;
  
  return currentTime >= dayHours.openTime && currentTime <= dayHours.closeTime;
}

/**
 * Calculate vendor score for ranking
 * @param {object} vendor - Vendor object
 * @param {number} distance - Distance from user in km
 * @returns {number} Vendor score (higher is better)
 */
function calculateVendorScore(vendor, distance) {
  let score = 0;
  
  // Rating factor (0-50 points)
  score += (vendor.rating || 0) * 10;
  
  // Review count factor (0-20 points)
  score += Math.min((vendor.reviewCount || 0) / 10, 20);
  
  // Distance factor (0-30 points, closer is better)
  score += Math.max(30 - (distance * 3), 0);
  
  // Activity factor (0-10 points)
  if (vendor.isOnline) score += 5;
  if (vendor.isOpen) score += 3;
  if (vendor.isActive) score += 2;
  
  // Verification factor (0-10 points)
  if (vendor.isVerified) score += 10;
  
  return Math.round(score);
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

/**
 * Get location accuracy description
 * @param {number} accuracy - GPS accuracy in meters
 * @returns {string} Accuracy description
 */
function getAccuracyDescription(accuracy) {
  if (accuracy <= 5) return 'Very High';
  if (accuracy <= 20) return 'High';
  if (accuracy <= 50) return 'Good';
  if (accuracy <= 100) return 'Fair';
  return 'Low';
}

module.exports = {
  calculateDistance,
  calculateDistanceInMeters,
  isValidCoordinates,
  isWithinServiceRadius,
  getBoundingBox,
  isVendorOpen,
  calculateVendorScore,
  formatDistance,
  getAccuracyDescription
};
