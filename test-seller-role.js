const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testSellerRole() {
  try {
    console.log('🔍 Testing seller role...');
    
    // First, let's try to get roles (this might require auth)
    console.log('\n📝 Testing roles endpoint...');
    try {
      const rolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`);
      console.log('✅ Roles endpoint response:', rolesResponse.data);
    } catch (error) {
      console.log('❌ Roles endpoint failed:', error.response?.status, error.response?.data);
    }
    
    // Try to update a user role with different role IDs
    console.log('\n📝 Testing user role update with different IDs...');
    const roleIds = [1, 2, 3, 4, 5];
    
    for (const roleId of roleIds) {
      try {
        console.log(`\n🔄 Testing role ID: ${roleId}`);
        const response = await axios.put(`${API_URL}/api/users/8`, {
          role: roleId
        });
        console.log(`✅ Role ID ${roleId} worked:`, response.data);
        break;
      } catch (error) {
        console.log(`❌ Role ID ${roleId} failed:`, error.response?.status, error.response?.data?.error?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSellerRole(); 