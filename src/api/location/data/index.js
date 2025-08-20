// Location data module - serves location data for both frontend and mobile app
const CHHATTISGARH_DATA = require('./states/chhattisgarh.js');

// Static list of available states
const STATES = [
  {
    id: "chhattisgarh",
    name: "Chhattisgarh",
    code: "CG",
    isActive: true
  }
  // Add more states as data becomes available
];

// State data mapping
const STATE_DATA_MAP = {
  'chhattisgarh': CHHATTISGARH_DATA.CHHATTISGARH_PINCODE_DATA || CHHATTISGARH_DATA.default || CHHATTISGARH_DATA,
  // Add more state mappings here
};

module.exports = {
  STATES,
  STATE_DATA_MAP,
  
  // Get all available states
  getStates: () => {
    return STATES.filter(state => state.isActive);
  },

  // Get state by ID
  getStateById: (stateId) => {
    return STATES.find(state => state.id === stateId);
  },

  // Get state by name
  getStateByName: (stateName) => {
    return STATES.find(state => 
      state.name.toLowerCase() === stateName.toLowerCase()
    );
  },

  // Get complete state data with districts and cities
  getStateData: (stateId) => {
    return STATE_DATA_MAP[stateId] || null;
  },

  // Get districts for a specific state
  getDistrictsForState: (stateId) => {
    const stateData = STATE_DATA_MAP[stateId];
    if (!stateData || !stateData.districts) return [];
    
    return stateData.districts.map(district => ({
      name: district.name,
      citiesCount: district.pincodes ? district.pincodes.length : 0
    }));
  },

  // Get cities for a specific district in a state
  getCitiesForDistrict: (stateId, districtName) => {
    const stateData = STATE_DATA_MAP[stateId];
    if (!stateData || !stateData.districts) return [];
    
    const district = stateData.districts.find(d => 
      d.name.toLowerCase() === districtName.toLowerCase()
    );
    
    return district && district.pincodes ? district.pincodes : [];
  },

  // Search cities by name across all districts in a state
  searchCitiesInState: (stateId, searchTerm) => {
    const stateData = STATE_DATA_MAP[stateId];
    if (!stateData || !stateData.districts) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const results = [];
    
    stateData.districts.forEach(district => {
      if (district.pincodes) {
        district.pincodes.forEach(city => {
          if (city.name.toLowerCase().includes(searchLower)) {
            results.push({
              ...city,
              district: district.name
            });
          }
        });
      }
    });
    
    return results;
  },

  // Get pincode for a specific city
  getPincodeForCity: (stateId, cityName) => {
    const stateData = STATE_DATA_MAP[stateId];
    if (!stateData || !stateData.districts) return null;
    
    for (const district of stateData.districts) {
      if (district.pincodes) {
        const city = district.pincodes.find(c => 
          c.name.toLowerCase() === cityName.toLowerCase()
        );
        if (city) {
          return {
            pincode: city.pincode,
            city: city.name,
            district: district.name
          };
        }
      }
    }
    
    return null;
  },

  // Validate pincode exists in state
  validatePincode: (stateId, pincode) => {
    const stateData = STATE_DATA_MAP[stateId];
    if (!stateData || !stateData.districts) return false;
    
    for (const district of stateData.districts) {
      if (district.pincodes) {
        const city = district.pincodes.find(c => c.pincode === pincode);
        if (city) {
          return {
            isValid: true,
            city: city.name,
            district: district.name,
            state: stateData.state
          };
        }
      }
    }
    
    return { isValid: false };
  }
};