'use strict';

/**
 * location controller - handles location data requests
 */

const locationData = require('../data/index.js');

module.exports = {
  // Get all available states
  async getStates(ctx) {
    try {
      const states = locationData.getStates();
      ctx.send({
        data: states,
        meta: {
          total: states.length
        }
      });
    } catch (error) {
      ctx.badRequest('Failed to fetch states', { error: error.message });
    }
  },

  // Get districts for a specific state
  async getDistricts(ctx) {
    try {
      const { stateId } = ctx.params;
      
      const state = locationData.getStateById(stateId);
      if (!state) {
        return ctx.notFound('State not found');
      }

      const districts = locationData.getDistrictsForState(stateId);
      
      ctx.send({
        data: districts,
        meta: {
          stateId,
          stateName: state.name,
          total: districts.length
        }
      });
    } catch (error) {
      ctx.badRequest('Failed to fetch districts', { error: error.message });
    }
  },

  // Get cities for a specific district in a state
  async getCities(ctx) {
    try {
      const { stateId, districtName } = ctx.params;
      
      const state = locationData.getStateById(stateId);
      if (!state) {
        return ctx.notFound('State not found');
      }

      const cities = locationData.getCitiesForDistrict(stateId, districtName);
      
      ctx.send({
        data: cities,
        meta: {
          stateId,
          stateName: state.name,
          districtName,
          total: cities.length
        }
      });
    } catch (error) {
      ctx.badRequest('Failed to fetch cities', { error: error.message });
    }
  },

  // Search cities in a state
  async searchCities(ctx) {
    try {
      const { stateId } = ctx.params;
      const { q: searchTerm, limit = 50 } = ctx.query;
      
      if (!searchTerm || searchTerm.length < 2) {
        return ctx.badRequest('Search term must be at least 2 characters');
      }

      const state = locationData.getStateById(stateId);
      if (!state) {
        return ctx.notFound('State not found');
      }

      let cities = locationData.searchCitiesInState(stateId, searchTerm);
      
      // Apply limit
      if (limit && cities.length > limit) {
        cities = cities.slice(0, parseInt(limit));
      }
      
      ctx.send({
        data: cities,
        meta: {
          stateId,
          stateName: state.name,
          searchTerm,
          total: cities.length,
          hasMore: locationData.searchCitiesInState(stateId, searchTerm).length > limit
        }
      });
    } catch (error) {
      ctx.badRequest('Failed to search cities', { error: error.message });
    }
  },

  // Get city details by pincode (searches across all states)
  async getCityByPincode(ctx) {
    try {
      const { pincode } = ctx.params;
      
      if (!pincode || pincode.length !== 6) {
        return ctx.badRequest('Pincode must be 6 digits');
      }

      // Search across all available states
      const states = locationData.getStates();
      let result = null;

      for (const state of states) {
        const cityInfo = locationData.getPincodeForCity(state.id, pincode);
        if (cityInfo) {
          result = {
            ...cityInfo,
            state: state.name,
            stateId: state.id
          };
          break;
        }
      }

      if (!result) {
        return ctx.notFound('Pincode not found');
      }

      ctx.send({
        data: result
      });
    } catch (error) {
      ctx.badRequest('Failed to fetch city by pincode', { error: error.message });
    }
  },

  // Validate pincode in a specific state
  async validatePincode(ctx) {
    try {
      const { stateId, pincode } = ctx.params;
      
      if (!pincode || pincode.length !== 6) {
        return ctx.badRequest('Pincode must be 6 digits');
      }

      const state = locationData.getStateById(stateId);
      if (!state) {
        return ctx.notFound('State not found');
      }

      const validation = locationData.validatePincode(stateId, pincode);
      
      ctx.send({
        data: {
          pincode,
          stateId,
          stateName: state.name,
          ...validation
        }
      });
    } catch (error) {
      ctx.badRequest('Failed to validate pincode', { error: error.message });
    }
  },

  // Get complete state data (for development/testing)
  async getCompleteStateData(ctx) {
    try {
      const { stateId } = ctx.params;
      
      const state = locationData.getStateById(stateId);
      if (!state) {
        return ctx.notFound('State not found');
      }

      const completeData = locationData.getStateData(stateId);
      
      if (!completeData) {
        return ctx.notFound('State data not available');
      }

      // Add summary statistics
      const totalDistricts = completeData.districts ? completeData.districts.length : 0;
      const totalCities = completeData.districts ? 
        completeData.districts.reduce((sum, district) => sum + (district.pincodes ? district.pincodes.length : 0), 0) : 0;

      ctx.send({
        data: completeData,
        meta: {
          stateId,
          stateName: state.name,
          totalDistricts,
          totalCities
        }
      });
    } catch (error) {
      ctx.badRequest('Failed to fetch complete state data', { error: error.message });
    }
  },
};