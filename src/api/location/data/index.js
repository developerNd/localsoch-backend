// Location data module - serves location data for both frontend and mobile app
// Auto-generated from India Pincode CSV data

const ANDHRA_PRADESH_DATA = require('./states/andhra-pradesh.js');
const TELANGANA_DATA = require('./states/telangana.js');
const BIHAR_DATA = require('./states/bihar.js');
const CHHATTISGARH_DATA = require('./states/chhattisgarh.js');
const JHARKHAND_DATA = require('./states/jharkhand.js');
const ASSAM_DATA = require('./states/assam.js');
const KARNATAKA_DATA = require('./states/karnataka.js');
const GUJARAT_DATA = require('./states/gujarat.js');
const DELHI_DATA = require('./states/delhi.js');
const THE_DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU_DATA = require('./states/dadra-nagar-haveli-daman-diu.js');
const HARYANA_DATA = require('./states/haryana.js');
const HIMACHAL_PRADESH_DATA = require('./states/himachal-pradesh.js');
const JAMMU_AND_KASHMIR_DATA = require('./states/jammu-kashmir.js');
const LADAKH_DATA = require('./states/ladakh.js');
const MAHARASHTRA_DATA = require('./states/maharashtra.js');
const MADHYA_PRADESH_DATA = require('./states/madhya-pradesh.js');
const KERALA_DATA = require('./states/kerala.js');
const GOA_DATA = require('./states/goa.js');
const MANIPUR_DATA = require('./states/manipur.js');
const MIZORAM_DATA = require('./states/mizoram.js');
const NAGALAND_DATA = require('./states/nagaland.js');
const TRIPURA_DATA = require('./states/tripura.js');
const ARUNACHAL_PRADESH_DATA = require('./states/arunachal-pradesh.js');
const MEGHALAYA_DATA = require('./states/meghalaya.js');
const ODISHA_DATA = require('./states/odisha.js');
const RAJASTHAN_DATA = require('./states/rajasthan.js');
const TAMIL_NADU_DATA = require('./states/tamil-nadu.js');
const PUDUCHERRY_DATA = require('./states/puducherry.js');
const CHANDIGARH_DATA = require('./states/chandigarh.js');
const PUNJAB_DATA = require('./states/punjab.js');
const UTTAR_PRADESH_DATA = require('./states/uttar-pradesh.js');
const UTTARAKHAND_DATA = require('./states/uttarakhand.js');
const WEST_BENGAL_DATA = require('./states/west-bengal.js');
const LAKSHADWEEP_DATA = require('./states/lakshadweep.js');
const ANDAMAN_AND_NICOBAR_ISLANDS_DATA = require('./states/andaman-nicobar.js');
const SIKKIM_DATA = require('./states/sikkim.js');

// Static list of available states
const STATES = [
  {
    "id": "andaman-nicobar",
    "name": "ANDAMAN AND NICOBAR ISLANDS",
    "code": "AN",
    "isActive": true
  },
  {
    "id": "andhra-pradesh",
    "name": "ANDHRA PRADESH",
    "code": "AP",
    "isActive": true
  },
  {
    "id": "arunachal-pradesh",
    "name": "ARUNACHAL PRADESH",
    "code": "AR",
    "isActive": true
  },
  {
    "id": "assam",
    "name": "ASSAM",
    "code": "AS",
    "isActive": true
  },
  {
    "id": "bihar",
    "name": "BIHAR",
    "code": "BR",
    "isActive": true
  },
  {
    "id": "chandigarh",
    "name": "CHANDIGARH",
    "code": "CH",
    "isActive": true
  },
  {
    "id": "chhattisgarh",
    "name": "CHHATTISGARH",
    "code": "CG",
    "isActive": true
  },
  {
    "id": "delhi",
    "name": "DELHI",
    "code": "DL",
    "isActive": true
  },
  {
    "id": "goa",
    "name": "GOA",
    "code": "GA",
    "isActive": true
  },
  {
    "id": "gujarat",
    "name": "GUJARAT",
    "code": "GJ",
    "isActive": true
  },
  {
    "id": "haryana",
    "name": "HARYANA",
    "code": "HR",
    "isActive": true
  },
  {
    "id": "himachal-pradesh",
    "name": "HIMACHAL PRADESH",
    "code": "HP",
    "isActive": true
  },
  {
    "id": "jammu-kashmir",
    "name": "JAMMU AND KASHMIR",
    "code": "JK",
    "isActive": true
  },
  {
    "id": "jharkhand",
    "name": "JHARKHAND",
    "code": "JH",
    "isActive": true
  },
  {
    "id": "karnataka",
    "name": "KARNATAKA",
    "code": "KA",
    "isActive": true
  },
  {
    "id": "kerala",
    "name": "KERALA",
    "code": "KL",
    "isActive": true
  },
  {
    "id": "ladakh",
    "name": "LADAKH",
    "code": "LA",
    "isActive": true
  },
  {
    "id": "lakshadweep",
    "name": "LAKSHADWEEP",
    "code": "LD",
    "isActive": true
  },
  {
    "id": "madhya-pradesh",
    "name": "MADHYA PRADESH",
    "code": "MP",
    "isActive": true
  },
  {
    "id": "maharashtra",
    "name": "MAHARASHTRA",
    "code": "MH",
    "isActive": true
  },
  {
    "id": "manipur",
    "name": "MANIPUR",
    "code": "MN",
    "isActive": true
  },
  {
    "id": "meghalaya",
    "name": "MEGHALAYA",
    "code": "ML",
    "isActive": true
  },
  {
    "id": "mizoram",
    "name": "MIZORAM",
    "code": "MZ",
    "isActive": true
  },
  {
    "name": "NA",
    "isActive": true
  },
  {
    "id": "nagaland",
    "name": "NAGALAND",
    "code": "NL",
    "isActive": true
  },
  {
    "id": "odisha",
    "name": "ODISHA",
    "code": "OD",
    "isActive": true
  },
  {
    "id": "puducherry",
    "name": "PUDUCHERRY",
    "code": "PY",
    "isActive": true
  },
  {
    "id": "punjab",
    "name": "PUNJAB",
    "code": "PB",
    "isActive": true
  },
  {
    "id": "rajasthan",
    "name": "RAJASTHAN",
    "code": "RJ",
    "isActive": true
  },
  {
    "id": "sikkim",
    "name": "SIKKIM",
    "code": "SK",
    "isActive": true
  },
  {
    "id": "tamil-nadu",
    "name": "TAMIL NADU",
    "code": "TN",
    "isActive": true
  },
  {
    "id": "telangana",
    "name": "TELANGANA",
    "code": "TS",
    "isActive": true
  },
  {
    "id": "dadra-nagar-haveli-daman-diu",
    "name": "THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU",
    "code": "DN",
    "isActive": true
  },
  {
    "id": "tripura",
    "name": "TRIPURA",
    "code": "TR",
    "isActive": true
  },
  {
    "id": "uttar-pradesh",
    "name": "UTTAR PRADESH",
    "code": "UP",
    "isActive": true
  },
  {
    "id": "uttarakhand",
    "name": "UTTARAKHAND",
    "code": "UK",
    "isActive": true
  },
  {
    "id": "west-bengal",
    "name": "WEST BENGAL",
    "code": "WB",
    "isActive": true
  }
];

// State data mapping
const STATE_DATA_MAP = {
  'andhra-pradesh': ANDHRA_PRADESH_DATA,
  'telangana': TELANGANA_DATA,
  'bihar': BIHAR_DATA,
  'chhattisgarh': CHHATTISGARH_DATA,
  'jharkhand': JHARKHAND_DATA,
  'assam': ASSAM_DATA,
  'karnataka': KARNATAKA_DATA,
  'gujarat': GUJARAT_DATA,
  'delhi': DELHI_DATA,
  'dadra-nagar-haveli-daman-diu': THE_DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU_DATA,
  'haryana': HARYANA_DATA,
  'himachal-pradesh': HIMACHAL_PRADESH_DATA,
  'jammu-kashmir': JAMMU_AND_KASHMIR_DATA,
  'ladakh': LADAKH_DATA,
  'maharashtra': MAHARASHTRA_DATA,
  'madhya-pradesh': MADHYA_PRADESH_DATA,
  'kerala': KERALA_DATA,
  'goa': GOA_DATA,
  'manipur': MANIPUR_DATA,
  'mizoram': MIZORAM_DATA,
  'nagaland': NAGALAND_DATA,
  'tripura': TRIPURA_DATA,
  'arunachal-pradesh': ARUNACHAL_PRADESH_DATA,
  'meghalaya': MEGHALAYA_DATA,
  'odisha': ODISHA_DATA,
  'rajasthan': RAJASTHAN_DATA,
  'tamil-nadu': TAMIL_NADU_DATA,
  'puducherry': PUDUCHERRY_DATA,
  'chandigarh': CHANDIGARH_DATA,
  'punjab': PUNJAB_DATA,
  'uttar-pradesh': UTTAR_PRADESH_DATA,
  'uttarakhand': UTTARAKHAND_DATA,
  'west-bengal': WEST_BENGAL_DATA,
  'lakshadweep': LAKSHADWEEP_DATA,
  'andaman-nicobar': ANDAMAN_AND_NICOBAR_ISLANDS_DATA,
  'sikkim': SIKKIM_DATA
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
  },

  // Search pincode across all states
  searchPincodeAcrossStates: (pincode) => {
    const results = [];
    
    Object.keys(STATE_DATA_MAP).forEach(stateId => {
      const stateData = STATE_DATA_MAP[stateId];
      if (stateData && stateData.districts) {
        for (const district of stateData.districts) {
          if (district.pincodes) {
            const city = district.pincodes.find(c => c.pincode === pincode);
            if (city) {
              results.push({
                pincode: city.pincode,
                city: city.name,
                district: district.name,
                state: stateData.state,
                stateId: stateId
              });
            }
          }
        }
      }
    });
    
    return results;
  }
};
