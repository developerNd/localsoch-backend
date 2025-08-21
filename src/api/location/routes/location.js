'use strict';

/**
 * location router - serves static location data
 */

module.exports = {
  routes: [
    // Get all available states
    {
      method: 'GET',
      path: '/location/states',
      handler: 'location.getStates',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: [],
      },
    },
    
    // Get districts for a specific state
    {
      method: 'GET',
      path: '/location/states/:stateId/districts',
      handler: 'location.getDistricts',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    
    // Get cities for a specific district in a state
    {
      method: 'GET',
      path: '/location/states/:stateId/districts/:districtName/cities',
      handler: 'location.getCities',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    
    // Get only cities (not villages) for a specific district in a state
    {
      method: 'GET',
      path: '/location/states/:stateId/districts/:districtName/cities-only',
      handler: 'location.getCitiesOnly',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    
    // Get all cities (not villages) for a state
    {
      method: 'GET',
      path: '/location/states/:stateId/cities',
      handler: 'location.getAllCities',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    
    // Get pincodes for a specific city in a state
    {
      method: 'GET',
      path: '/location/states/:stateId/cities/:cityName/pincodes',
      handler: 'location.getPincodesForCity',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    
    // Search cities in a state
    {
      method: 'GET',
      path: '/location/states/:stateId/cities/search',
      handler: 'location.searchCities',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    
    // Get city details by pincode
    {
      method: 'GET',
      path: '/location/pincode/:pincode',
      handler: 'location.getCityByPincode',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    
    // Validate pincode in a specific state
    {
      method: 'GET',
      path: '/location/validate/states/:stateId/pincode/:pincode',
      handler: 'location.validatePincode',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    
    // Get complete location data for a state (for development/testing)
    {
      method: 'GET',
      path: '/location/states/:stateId/complete',
      handler: 'location.getCompleteStateData',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};