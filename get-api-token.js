const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function getApiToken() {
  try {
    console.log('🔑 Getting API token for admin user...');
    
    // Login with admin credentials
    const loginResponse = await axios.post(`${STRAPI_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin123!'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Login successful!');
    console.log('🎫 JWT Token:', jwt);
    
    // Get API tokens
    const tokensResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/tokens`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    
    console.log('📋 Available API tokens:');
    tokensResponse.data.forEach(token => {
      console.log(`- ${token.name}: ${token.accessKey}`);
    });
    
    // Create a new API token if none exist
    if (tokensResponse.data.length === 0) {
      console.log('🔧 Creating new API token...');
      const createTokenResponse = await axios.post(`${STRAPI_URL}/api/users-permissions/tokens`, {
        name: 'Admin API Token',
        description: 'Token for admin operations',
        type: 'read-only'
      }, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      
      console.log('✅ New API token created:');
      console.log('🔑 Access Key:', createTokenResponse.data.accessKey);
      console.log('🔐 Secret Key:', createTokenResponse.data.secretKey);
      
      return createTokenResponse.data.accessKey;
    } else {
      return tokensResponse.data[0].accessKey;
    }
    
  } catch (error) {
    console.error('❌ Error getting API token:', error.response?.data || error.message);
    return null;
  }
}

// Run the script
getApiToken().then(token => {
  if (token) {
    console.log('🎉 API token retrieved successfully!');
    console.log('🔑 Use this token in your scripts:', token);
  } else {
    console.log('💥 Failed to get API token.');
  }
}); 