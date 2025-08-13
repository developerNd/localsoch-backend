const axios = require('axios');

const API_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

const headers = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json'
};

async function assignAdminRole() {
  console.log('🔧 Assigning admin role to admin user...');

  try {
    // Update the admin user (ID: 5) to have the admin role (ID: 4)
    const updateResponse = await axios.put(
      `${API_URL}/api/users/5`,
      {
        role: 4  // Admin role ID
      },
      { headers }
    );

    console.log('✅ Admin role assigned successfully');
    console.log('✅ Updated user:', updateResponse.data);

    // Test the user/me endpoint again
    console.log('\n🧪 Testing user authentication with admin role...');
    
    // Login to get a fresh token
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@example.com',
      password: 'admin123'
    });

    const { jwt } = loginResponse.data;
    console.log('✅ Login successful');

    // Test user/me endpoint
    const meResponse = await axios.get(`${API_URL}/api/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    console.log('✅ /api/users/me successful');
    console.log('✅ User role:', meResponse.data.role?.name);

    console.log('\n🎉 Admin role assignment successful!');
    console.log('📝 The admin panel should now work correctly');

  } catch (error) {
    console.error('❌ Error assigning admin role:', error.response?.data || error.message);
  }
}

assignAdminRole(); 