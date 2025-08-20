// Test script for location API endpoints
const { exec } = require('child_process');

const BASE_URL = 'http://localhost:1337/api';

// Helper function to make HTTP requests
async function testEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    const command = `curl -s "${BASE_URL}${endpoint}"`;
    
    console.log(`\n=== ${description} ===`);
    console.log(`Testing: ${endpoint}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        resolve(false);
        return;
      }
      
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        resolve(false);
        return;
      }
      
      try {
        const response = JSON.parse(stdout);
        console.log('Response:', JSON.stringify(response, null, 2));
        resolve(true);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', stdout);
        resolve(false);
      }
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Location API Endpoints');
  console.log('⚠️  Make sure the Strapi server is running on localhost:1337');
  
  const tests = [
    {
      endpoint: '/location/states',
      description: 'Get All States'
    },
    {
      endpoint: '/location/states/chhattisgarh/districts',
      description: 'Get Districts for Chhattisgarh'
    },
    {
      endpoint: '/location/states/chhattisgarh/districts/BALOD/cities',
      description: 'Get Cities in BALOD District'
    },
    {
      endpoint: '/location/states/chhattisgarh/cities/search?q=gar&limit=5',
      description: 'Search Cities containing "gar"'
    },
    {
      endpoint: '/location/pincode/491225',
      description: 'Get City by Pincode 491225'
    },
    {
      endpoint: '/location/validate/states/chhattisgarh/pincode/491225',
      description: 'Validate Pincode in Chhattisgarh'
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.description);
    if (success) passedTests++;
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Tests completed: ${passedTests}/${tests.length} passed`);
  
  if (passedTests === 0) {
    console.log('\n🚨 All tests failed. Please check:');
    console.log('1. Strapi server is running (npm run develop)');
    console.log('2. Server is accessible at http://localhost:1337');
    console.log('3. Location module routes are properly configured');
  }
}

runTests().catch(console.error);