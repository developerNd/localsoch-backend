const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function checkRoles() {
  try {
    console.log('🔍 Checking available roles...');
    
    // Try to get roles without authentication first
    const rolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`);
    console.log('✅ Roles found:', rolesResponse.data.roles);
    
    // Try to login and get authenticated roles
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin123!'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Login successful!');
    
    const authHeaders = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    const authRolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`, { headers: authHeaders });
    console.log('✅ Authenticated roles:', authRolesResponse.data.roles);
    
    // Check specific role IDs
    for (let i = 1; i <= 5; i++) {
      try {
        const roleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/${i}`, { headers: authHeaders });
        console.log(`✅ Role ${i}:`, roleResponse.data.role.name);
      } catch (error) {
        console.log(`❌ Role ${i}: Not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking roles:', error.response?.data || error.message);
  }
}

checkRoles(); 