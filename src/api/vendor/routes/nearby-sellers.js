/**
 * Nearby Sellers API Routes
 * Custom routes for location-based vendor searches
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/vendors/nearby',
      handler: 'nearby-sellers.findNearby',
      config: {
        policies: [],
        middlewares: [],
        description: 'Find nearby sellers based on user location',
        tags: ['Vendors', 'Location']
      }
    },
    {
      method: 'GET',
      path: '/vendors/nearby/:id',
      handler: 'nearby-sellers.getVendorWithDistance',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get vendor details with distance from user',
        tags: ['Vendors', 'Location']
      }
    },
    {
      method: 'GET',
      path: '/vendors/search',
      handler: 'nearby-sellers.searchVendors',
      config: {
        policies: [],
        middlewares: [],
        description: 'Search vendors with advanced filters',
        tags: ['Vendors', 'Location', 'Search']
      }
    }
  ]
};
