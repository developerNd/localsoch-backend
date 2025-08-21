const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testFrontendApiCall() {
  console.log('🧪 Testing Frontend API Call');
  console.log('============================');
  
  try {
    // Test the exact query used in frontend
    console.log('\n1️⃣ Testing frontend query: /api/users?populate[role]=*');
    
    const response = await axios.get(`${API_URL}/api/users?populate[role]=*`);
    console.log('✅ Response status:', response.status);
    console.log('✅ Response type:', typeof response.data);
    console.log('✅ Is array:', Array.isArray(response.data));
    console.log('✅ Users count:', response.data.length || 0);
    
    if (response.data.length > 0) {
      console.log('✅ Sample users:');
      response.data.slice(0, 5).forEach((user, index) => {
        console.log(`   User ${index + 1}:`, {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          hasRole: !!user.role,
          roleName: user.role?.name,
          roleId: user.role?.id
        });
      });
      
      // Count users with and without roles
      const usersWithRoles = response.data.filter(user => user.role);
      const usersWithoutRoles = response.data.filter(user => !user.role);
      
      console.log('\n📊 Role Population Summary:');
      console.log('===========================');
      console.log(`Users with roles: ${usersWithRoles.length}`);
      console.log(`Users without roles: ${usersWithoutRoles.length}`);
      console.log(`Total users: ${response.data.length}`);
      
      if (usersWithoutRoles.length > 0) {
        console.log('\n⚠️  Users without roles:');
        usersWithoutRoles.slice(0, 5).forEach((user, index) => {
          console.log(`   User ${index + 1}: ID=${user.id}, Username=${user.username}, Role=${user.role}`);
        });
      }
    }

    // Test with different populate syntax
    console.log('\n2️⃣ Testing alternative populate syntax...');
    
    const response2 = await axios.get(`${API_URL}/api/users?populate=*`);
    console.log('✅ Response with populate=*:', response2.data.length || 0);
    
    const response3 = await axios.get(`${API_URL}/api/users?populate[role]=true`);
    console.log('✅ Response with populate[role]=true:', response3.data.length || 0);
    
    const response4 = await axios.get(`${API_URL}/api/users?populate[0]=role`);
    console.log('✅ Response with populate[0]=role:', response4.data.length || 0);

    // Test with authentication header (simulate frontend)
    console.log('\n3️⃣ Testing with authentication...');
    
    // First get a JWT token
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.jwt) {
      console.log('✅ Got JWT token');
      
      const authResponse = await axios.get(`${API_URL}/api/users?populate[role]=*`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.jwt}`
        }
      });
      
      console.log('✅ Response with auth:', authResponse.data.length || 0);
      
      if (authResponse.data.length > 0) {
        const usersWithRoles = authResponse.data.filter(user => user.role);
        const usersWithoutRoles = authResponse.data.filter(user => !user.role);
        
        console.log(`   Users with roles: ${usersWithRoles.length}`);
        console.log(`   Users without roles: ${usersWithoutRoles.length}`);
      }
    } else {
      console.log('❌ Failed to get JWT token');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendApiCall(); 