const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration
const CSV_FILE_PATH = path.join(__dirname, '../src/api/location/data/5c2f62fe-5afa-4119-a499-fec9d604d5bd.csv');
const OUTPUT_DIR = path.join(__dirname, '../src/api/location/data/states');
const INDEX_FILE_PATH = path.join(__dirname, '../src/api/location/data/index.js');

// State code mapping
const STATE_CODES = {
  'ANDHRA PRADESH': 'AP',
  'ARUNACHAL PRADESH': 'AR',
  'ASSAM': 'AS',
  'BIHAR': 'BR',
  'CHANDIGARH': 'CH',
  'CHHATTISGARH': 'CG',
  'DELHI': 'DL',
  'GOA': 'GA',
  'GUJARAT': 'GJ',
  'HARYANA': 'HR',
  'HIMACHAL PRADESH': 'HP',
  'JHARKHAND': 'JH',
  'KARNATAKA': 'KA',
  'KERALA': 'KL',
  'MADHYA PRADESH': 'MP',
  'MAHARASHTRA': 'MH',
  'MANIPUR': 'MN',
  'MEGHALAYA': 'ML',
  'MIZORAM': 'MZ',
  'NAGALAND': 'NL',
  'ODISHA': 'OD',
  'PUNJAB': 'PB',
  'RAJASTHAN': 'RJ',
  'SIKKIM': 'SK',
  'TAMIL NADU': 'TN',
  'TELANGANA': 'TS',
  'TRIPURA': 'TR',
  'UTTAR PRADESH': 'UP',
  'UTTARAKHAND': 'UK',
  'WEST BENGAL': 'WB',
  'ANDAMAN AND NICOBAR ISLANDS': 'AN',
  'JAMMU AND KASHMIR': 'JK',
  'LADAKH': 'LA',
  'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU': 'DN',
  'LAKSHADWEEP': 'LD',
  'PUDUCHERRY': 'PY'
};

// State ID mapping (lowercase, hyphenated)
const STATE_IDS = {
  'ANDHRA PRADESH': 'andhra-pradesh',
  'ARUNACHAL PRADESH': 'arunachal-pradesh',
  'ASSAM': 'assam',
  'BIHAR': 'bihar',
  'CHANDIGARH': 'chandigarh',
  'CHHATTISGARH': 'chhattisgarh',
  'DELHI': 'delhi',
  'GOA': 'goa',
  'GUJARAT': 'gujarat',
  'HARYANA': 'haryana',
  'HIMACHAL PRADESH': 'himachal-pradesh',
  'JHARKHAND': 'jharkhand',
  'KARNATAKA': 'karnataka',
  'KERALA': 'kerala',
  'MADHYA PRADESH': 'madhya-pradesh',
  'MAHARASHTRA': 'maharashtra',
  'MANIPUR': 'manipur',
  'MEGHALAYA': 'meghalaya',
  'MIZORAM': 'mizoram',
  'NAGALAND': 'nagaland',
  'ODISHA': 'odisha',
  'PUNJAB': 'punjab',
  'RAJASTHAN': 'rajasthan',
  'SIKKIM': 'sikkim',
  'TAMIL NADU': 'tamil-nadu',
  'TELANGANA': 'telangana',
  'TRIPURA': 'tripura',
  'UTTAR PRADESH': 'uttar-pradesh',
  'UTTARAKHAND': 'uttarakhand',
  'WEST BENGAL': 'west-bengal',
  'ANDAMAN AND NICOBAR ISLANDS': 'andaman-nicobar',
  'JAMMU AND KASHMIR': 'jammu-kashmir',
  'LADAKH': 'ladakh',
  'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU': 'dadra-nagar-haveli-daman-diu',
  'LAKSHADWEEP': 'lakshadweep',
  'PUDUCHERRY': 'puducherry'
};

// Data storage
const stateData = {};
const stateStats = {};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🚀 Starting CSV parsing...');
console.log(`📁 Reading from: ${CSV_FILE_PATH}`);
console.log(`📁 Output directory: ${OUTPUT_DIR}`);

// Parse CSV and organize data
fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on('data', (row) => {
    try {
      // Clean and extract data
      const stateName = row.statename?.replace(/"/g, '').trim();
      const districtName = row.district?.replace(/"/g, '').trim();
      const officeName = row.officename?.replace(/"/g, '').trim();
      const pincode = row.pincode?.replace(/"/g, '').trim();
      const latitude = parseFloat(row.latitude) || null;
      const longitude = parseFloat(row.longitude) || null;
      const officeType = row.officetype?.replace(/"/g, '').trim();
      const delivery = row.delivery?.replace(/"/g, '').trim();

      // Skip if essential data is missing
      if (!stateName || !districtName || !officeName || !pincode) {
        return;
      }

      // Initialize state data if not exists
      if (!stateData[stateName]) {
        stateData[stateName] = {
          state: stateName,
          districts: {}
        };
        stateStats[stateName] = {
          totalOffices: 0,
          totalDistricts: 0,
          totalPincodes: new Set()
        };
      }

      // Initialize district data if not exists
      if (!stateData[stateName].districts[districtName]) {
        stateData[stateName].districts[districtName] = {
          name: districtName,
          pincodes: []
        };
        stateStats[stateName].totalDistricts++;
      }

      // Add office/pincode data
      const pincodeData = {
        name: officeName,
        pincode: pincode,
        officeType: officeType,
        delivery: delivery,
        coordinates: latitude && longitude ? { latitude, longitude } : null
      };

      // Check if this pincode already exists for this office
      const existingIndex = stateData[stateName].districts[districtName].pincodes.findIndex(
        p => p.name === officeName && p.pincode === pincode
      );

      if (existingIndex === -1) {
        stateData[stateName].districts[districtName].pincodes.push(pincodeData);
        stateStats[stateName].totalOffices++;
        stateStats[stateName].totalPincodes.add(pincode);
      }
    } catch (error) {
      console.error('Error processing row:', error, row);
    }
  })
  .on('end', () => {
    console.log('✅ CSV parsing completed!');
    generateStateFiles();
    generateUpdatedIndex();
    printStatistics();
  })
  .on('error', (error) => {
    console.error('❌ Error reading CSV:', error);
  });

function generateStateFiles() {
  console.log('\n📝 Generating state files...');
  
  Object.keys(stateData).forEach(stateName => {
    const stateId = STATE_IDS[stateName];
    if (!stateId) {
      console.warn(`⚠️  No state ID mapping found for: ${stateName}`);
      return;
    }

    // Convert districts object to array
    const districtsArray = Object.values(stateData[stateName].districts);
    
    // Sort districts by name
    districtsArray.sort((a, b) => a.name.localeCompare(b.name));
    
    // Sort pincodes within each district
    districtsArray.forEach(district => {
      district.pincodes.sort((a, b) => a.name.localeCompare(b.name));
    });

    const stateDataObject = {
      state: stateName,
      districts: districtsArray
    };

    // Generate file content
    const fileContent = `// Auto-generated from India Pincode CSV data
// State: ${stateName}
// Total Districts: ${districtsArray.length}
// Total Offices: ${stateStats[stateName].totalOffices}
// Total Unique Pincodes: ${stateStats[stateName].totalPincodes.size}

const ${stateName.replace(/\s+/g, '_').toUpperCase()}_PINCODE_DATA = ${JSON.stringify(stateDataObject, null, 2)};

// Export for CommonJS
module.exports = ${stateName.replace(/\s+/g, '_').toUpperCase()}_PINCODE_DATA;
`;

    const fileName = `${stateId}.js`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    fs.writeFileSync(filePath, fileContent);
    console.log(`✅ Generated: ${fileName} (${districtsArray.length} districts, ${stateStats[stateName].totalOffices} offices)`);
  });
}

function generateUpdatedIndex() {
  console.log('\n📝 Updating main index.js file...');
  
  // Generate states array
  const statesArray = Object.keys(stateData).map(stateName => {
    const stateId = STATE_IDS[stateName];
    const stateCode = STATE_CODES[stateName];
    
    return {
      id: stateId,
      name: stateName,
      code: stateCode,
      isActive: true
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Generate state data mapping
  const stateDataMapping = {};
  Object.keys(stateData).forEach(stateName => {
    const stateId = STATE_IDS[stateName];
    if (stateId) {
      stateDataMapping[`'${stateId}'`] = `${stateName.replace(/\s+/g, '_').toUpperCase()}_DATA`;
    }
  });

  // Generate import statements
  const importStatements = Object.keys(stateData).map(stateName => {
    const stateId = STATE_IDS[stateName];
    if (stateId) {
      return `const ${stateName.replace(/\s+/g, '_').toUpperCase()}_DATA = require('./states/${stateId}.js');`;
    }
    return null;
  }).filter(Boolean);

  // Generate new index.js content
  const indexContent = `// Location data module - serves location data for both frontend and mobile app
// Auto-generated from India Pincode CSV data

${importStatements.join('\n')}

// Static list of available states
const STATES = ${JSON.stringify(statesArray, null, 2)};

// State data mapping
const STATE_DATA_MAP = {
${Object.entries(stateDataMapping).map(([key, value]) => `  ${key}: ${value}`).join(',\n')}
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
`;

  // Write the updated index.js file
  fs.writeFileSync(INDEX_FILE_PATH, indexContent);
  console.log('✅ Updated index.js file');
}

function printStatistics() {
  console.log('\n📊 PARSING STATISTICS:');
  console.log('=' .repeat(50));
  
  const totalStates = Object.keys(stateData).length;
  const totalDistricts = Object.values(stateStats).reduce((sum, stats) => sum + stats.totalDistricts, 0);
  const totalOffices = Object.values(stateStats).reduce((sum, stats) => sum + stats.totalOffices, 0);
  const totalUniquePincodes = Object.values(stateStats).reduce((sum, stats) => sum + stats.totalPincodes.size, 0);

  console.log(`Total States: ${totalStates}`);
  console.log(`Total Districts: ${totalDistricts}`);
  console.log(`Total Offices: ${totalOffices}`);
  console.log(`Total Unique Pincodes: ${totalUniquePincodes}`);
  
  console.log('\n📋 State-wise Breakdown:');
  console.log('-' .repeat(50));
  
  Object.keys(stateData).sort().forEach(stateName => {
    const stats = stateStats[stateName];
    console.log(`${stateName.padEnd(30)} | Districts: ${stats.totalDistricts.toString().padStart(3)} | Offices: ${stats.totalOffices.toString().padStart(5)} | Pincodes: ${stats.totalPincodes.size.toString().padStart(4)}`);
  });

  console.log('\n🎉 Script completed successfully!');
  console.log('📁 Generated files:');
  console.log(`   - ${Object.keys(stateData).length} state files in: ${OUTPUT_DIR}`);
  console.log(`   - Updated index file: ${INDEX_FILE_PATH}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Test the API endpoints with the new data');
  console.log('   2. Update any frontend components to use the new state IDs');
}