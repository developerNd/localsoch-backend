// Test script for location module
const locationData = require('./src/api/location/data/index.js');

console.log('=== Testing Location Module ===\n');

// Test 1: Get all states
console.log('1. Testing getStates():');
const states = locationData.getStates();
console.log(`Found ${states.length} states:`, states);
console.log('');

// Test 2: Get state by ID
console.log('2. Testing getStateById():');
const chhattisgarh = locationData.getStateById('chhattisgarh');
console.log('Chhattisgarh state:', chhattisgarh);
console.log('');

// Test 3: Get districts for Chhattisgarh
console.log('3. Testing getDistrictsForState():');
const districts = locationData.getDistrictsForState('chhattisgarh');
console.log(`Found ${districts.length} districts in Chhattisgarh`);
console.log('First 5 districts:', districts.slice(0, 5));
console.log('');

// Test 4: Get cities for a specific district
console.log('4. Testing getCitiesForDistrict():');
if (districts.length > 0) {
  const firstDistrict = districts[0].name;
  const cities = locationData.getCitiesForDistrict('chhattisgarh', firstDistrict);
  console.log(`Found ${cities.length} cities in ${firstDistrict} district`);
  console.log('First 5 cities:', cities.slice(0, 5));
} else {
  console.log('No districts found');
}
console.log('');

// Test 5: Search cities
console.log('5. Testing searchCitiesInState():');
const searchResults = locationData.searchCitiesInState('chhattisgarh', 'gar');
console.log(`Found ${searchResults.length} cities containing "gar"`);
console.log('Search results:', searchResults.slice(0, 5));
console.log('');

// Test 6: Get pincode for a city
console.log('6. Testing getPincodeForCity():');
if (searchResults.length > 0) {
  const cityName = searchResults[0].name;
  const pincodeInfo = locationData.getPincodeForCity('chhattisgarh', cityName);
  console.log(`Pincode info for ${cityName}:`, pincodeInfo);
} else {
  console.log('No search results to test with');
}
console.log('');

// Test 7: Validate pincode
console.log('7. Testing validatePincode():');
if (searchResults.length > 0) {
  const testPincode = searchResults[0].pincode;
  const validation = locationData.validatePincode('chhattisgarh', testPincode);
  console.log(`Validation for pincode ${testPincode}:`, validation);
} else {
  console.log('No search results to test with');
}
console.log('');

// Test 8: Test invalid cases
console.log('8. Testing invalid cases:');
const invalidState = locationData.getStateById('invalid');
console.log('Invalid state:', invalidState);

const invalidPincode = locationData.validatePincode('chhattisgarh', '000000');
console.log('Invalid pincode validation:', invalidPincode);

console.log('\n=== Location Module Tests Complete ===');
