const axios = require('axios');

const API_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

const headers = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json'
};

async function checkCurrentPermissions() {
  console.log('🔍 Checking current permissions...');

  try {
    // Get the public role (ID: 1)
    const roleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/1`, { headers });
    const publicRole = roleResponse.data.role;
    
    console.log('✅ Current public role permissions:');
    console.log(JSON.stringify(publicRole.permissions, null, 2));

    // Check if product permissions exist
    if (publicRole.permissions['api::product.product']) {
      console.log('\n✅ Product permissions found:');
      console.log(JSON.stringify(publicRole.permissions['api::product.product'], null, 2));
    } else {
      console.log('\n❌ No product permissions found');
    }

    // Check if vendor permissions exist
    if (publicRole.permissions['api::vendor.vendor']) {
      console.log('\n✅ Vendor permissions found:');
      console.log(JSON.stringify(publicRole.permissions['api::vendor.vendor'], null, 2));
    } else {
      console.log('\n❌ No vendor permissions found');
    }

  } catch (error) {
    console.error('❌ Error checking permissions:', error.response?.data || error.message);
  }
}

checkCurrentPermissions(); 