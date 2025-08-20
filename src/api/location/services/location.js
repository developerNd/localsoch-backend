'use strict';

/**
 * location service - business logic for location operations
 */

const locationData = require('../data/index.js');

module.exports = {
  // Get formatted location hierarchy for dropdowns
  async getLocationHierarchy(stateId) {
    try {
      const state = locationData.getStateById(stateId);
      if (!state) {
        throw new Error('State not found');
      }

      const districts = locationData.getDistrictsForState(stateId);
      const hierarchy = {
        state: {
          id: state.id,
          name: state.name,
          code: state.code
        },
        districts: districts.map(district => ({
          name: district.name,
          citiesCount: district.citiesCount
        }))
      };

      return hierarchy;
    } catch (error) {
      throw error;
    }
  },

  // Get popular cities for a state (cities with most pincodes or specific criteria)
  async getPopularCities(stateId, limit = 10) {
    try {
      const stateData = locationData.getStateData(stateId);
      if (!stateData || !stateData.districts) {
        throw new Error('State data not found');
      }

      const allCities = [];
      
      stateData.districts.forEach(district => {
        if (district.pincodes) {
          district.pincodes.forEach(city => {
            allCities.push({
              ...city,
              district: district.name
            });
          });
        }
      });

      // Sort alphabetically and take first 'limit' cities
      // You could implement more sophisticated logic here (by population, etc.)
      const popularCities = allCities
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, limit);

      return popularCities;
    } catch (error) {
      throw error;
    }
  },

  // Validate and format address components
  async validateAddressComponents(addressData) {
    try {
      const { stateId, districtName, cityName, pincode } = addressData;
      
      if (!stateId || !cityName || !pincode) {
        throw new Error('Missing required address components');
      }

      const state = locationData.getStateById(stateId);
      if (!state) {
        throw new Error('Invalid state');
      }

      // Validate pincode format
      if (!/^\d{6}$/.test(pincode)) {
        throw new Error('Invalid pincode format');
      }

      // Check if the combination is valid
      const validation = locationData.validatePincode(stateId, pincode);
      if (!validation.isValid) {
        throw new Error('Pincode does not belong to the selected state');
      }

      // If district is provided, validate it matches
      if (districtName && validation.district.toLowerCase() !== districtName.toLowerCase()) {
        throw new Error('District does not match the pincode');
      }

      // If city name doesn't match exactly, check if it's a close match
      if (validation.city.toLowerCase() !== cityName.toLowerCase()) {
        // You could implement fuzzy matching here
        throw new Error('City name does not match the pincode');
      }

      return {
        isValid: true,
        formatted: {
          city: validation.city,
          district: validation.district,
          state: validation.state,
          pincode: pincode,
          stateId: stateId
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  },

  // Get location suggestions for autocomplete
  async getLocationSuggestions(stateId, query, type = 'all') {
    try {
      const state = locationData.getStateById(stateId);
      if (!state) {
        throw new Error('State not found');
      }

      const suggestions = [];
      
      if (type === 'all' || type === 'cities') {
        const cities = locationData.searchCitiesInState(stateId, query);
        cities.forEach(city => {
          suggestions.push({
            type: 'city',
            value: city.name,
            pincode: city.pincode,
            district: city.district,
            label: `${city.name}, ${city.district} - ${city.pincode}`
          });
        });
      }

      if (type === 'all' || type === 'districts') {
        const districts = locationData.getDistrictsForState(stateId);
        const matchingDistricts = districts.filter(district => 
          district.name.toLowerCase().includes(query.toLowerCase())
        );
        
        matchingDistricts.forEach(district => {
          suggestions.push({
            type: 'district',
            value: district.name,
            label: `${district.name} (District)`,
            citiesCount: district.citiesCount
          });
        });
      }

      return suggestions.slice(0, 20); // Limit suggestions
    } catch (error) {
      throw error;
    }
  },

  // Check if location delivery is available (can be extended with business logic)
  async checkDeliveryAvailability(stateId, pincode) {
    try {
      const validation = locationData.validatePincode(stateId, pincode);
      
      if (!validation.isValid) {
        return {
          available: false,
          reason: 'Location not found'
        };
      }

      // Add business logic here for delivery availability
      // For now, all valid locations have delivery available
      return {
        available: true,
        city: validation.city,
        district: validation.district,
        estimatedDeliveryDays: 2 // Default delivery time
      };
    } catch (error) {
      return {
        available: false,
        reason: 'Unable to check delivery availability'
      };
    }
  }
};