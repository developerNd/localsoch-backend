const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function checkProductRoutes() {
  try {
    console.log('🔍 Checking product routes and controllers...');
    
    // Step 1: Login with super admin
    console.log('\n🔐 Step 1: Logging in with super admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Super admin login successful!');
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Check different product endpoints
    console.log('\n🔍 Step 2: Testing different product endpoints...');
    
    const endpoints = [
      '/api/products',
      '/api/product',
      '/api/products/create',
      '/api/product/create'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\nTesting ${endpoint}...`);
        
        // Test GET
        try {
          const getResponse = await axios.get(`${API_URL}${endpoint}`, { headers });
          console.log(`✅ GET ${endpoint}: Success (${getResponse.data.data?.length || 0} items)`);
        } catch (error) {
          console.log(`❌ GET ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
        }
        
        // Test POST
        try {
          const postResponse = await axios.post(`${API_URL}${endpoint}`, {
            data: {
              name: 'Test Product',
              description: 'Test description',
              price: 100.00
            }
          }, { headers });
          console.log(`✅ POST ${endpoint}: Success (ID: ${postResponse.data.data?.id})`);
        } catch (error) {
          console.log(`❌ POST ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
        }
        
      } catch (error) {
        console.log(`❌ Error testing ${endpoint}:`, error.message);
      }
    }
    
    // Step 3: Check if there are custom controllers
    console.log('\n🔍 Step 3: Checking for custom controllers...');
    try {
      const contentTypesResponse = await axios.get(`${API_URL}/api/content-type-builder/content-types`, { headers });
      console.log('Available content types:', contentTypesResponse.data.data?.length || 0);
      
      // Look for product-related content types
      const productTypes = contentTypesResponse.data.data?.filter(ct => 
        ct.uid?.includes('product') || ct.info?.name?.toLowerCase().includes('product')
      );
      
      if (productTypes && productTypes.length > 0) {
        console.log('Product-related content types found:');
        for (const pt of productTypes) {
          console.log(`- ${pt.info.name} (${pt.uid})`);
        }
      } else {
        console.log('No product-related content types found');
      }
      
    } catch (error) {
      console.log('❌ Error checking content types:', error.response?.status);
    }
    
    // Step 4: Try creating product with different data structure
    console.log('\n🔍 Step 4: Testing different data structures...');
    
    const testStructures = [
      // Structure 1: Basic fields only
      {
        name: 'Test Product 1',
        description: 'Test description',
        price: 100.00
      },
      // Structure 2: With all required fields
      {
        name: 'Test Product 2',
        description: 'Test description',
        price: 100.00,
        stock: 10
      },
      // Structure 3: With data wrapper
      {
        data: {
          name: 'Test Product 3',
          description: 'Test description',
          price: 100.00
        }
      }
    ];
    
    for (let i = 0; i < testStructures.length; i++) {
      try {
        console.log(`\nTesting structure ${i + 1}...`);
        const response = await axios.post(`${API_URL}/api/products`, testStructures[i], { headers });
        console.log(`✅ Structure ${i + 1} successful: ${response.data.data?.id}`);
      } catch (error) {
        console.log(`❌ Structure ${i + 1} failed: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    // Step 5: Check if there are any custom routes in the project
    console.log('\n🔍 Step 5: Checking for custom routes...');
    try {
      // Try to access routes that might exist
      const customEndpoints = [
        '/api/products/seed',
        '/api/products/bulk-create',
        '/api/admin/products',
        '/api/v1/products'
      ];
      
      for (const endpoint of customEndpoints) {
        try {
          const response = await axios.get(`${API_URL}${endpoint}`, { headers });
          console.log(`✅ Custom endpoint ${endpoint}: Success`);
        } catch (error) {
          console.log(`❌ Custom endpoint ${endpoint}: ${error.response?.status}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Error checking custom routes:', error.message);
    }
    
    console.log('\n🎉 Product route analysis completed!');
    
  } catch (error) {
    console.error('❌ Error analyzing product routes:', error.response?.data || error.message);
  }
}

checkProductRoutes(); 