const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testUserRolePopulation() {
  console.log('🧪 Testing User Role Population');
  console.log('================================');
  
  try {
    // Test users with role population
    console.log('\n1️⃣ Testing users with role population...');
    
    // Test all users with role populated
    const allUsersResponse = await axios.get(`${API_URL}/api/users?populate[role]=*`);
    console.log('✅ All users with role populated:', allUsersResponse.data.length || 0);
    
    if (allUsersResponse.data.length > 0) {
      console.log('✅ Sample users with roles:');
      allUsersResponse.data.slice(0, 3).forEach((user, index) => {
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
    }

    // Test users without role population
    console.log('\n2️⃣ Testing users without role population...');
    const usersNoRoleResponse = await axios.get(`${API_URL}/api/users`);
    console.log('✅ All users without role populated:', usersNoRoleResponse.data.length || 0);
    
    if (usersNoRoleResponse.data.length > 0) {
      console.log('✅ Sample users without roles:');
      usersNoRoleResponse.data.slice(0, 3).forEach((user, index) => {
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
    }

    // Test specific role queries
    console.log('\n3️⃣ Testing specific role queries...');
    
    // Test authenticated users with role populated
    const authUsersResponse = await axios.get(`${API_URL}/api/users?populate[role]=*&filters[role][id][$eq]=1`);
    console.log('✅ Authenticated users with role populated:', authUsersResponse.data.length || 0);
    
    // Test sellers with role populated
    const sellersResponse = await axios.get(`${API_URL}/api/users?populate[role]=*&filters[role][id][$eq]=4`);
    console.log('✅ Sellers with role populated:', sellersResponse.data.length || 0);

    // Test the exact query used in frontend
    console.log('\n4️⃣ Testing frontend query...');
    const frontendQueryResponse = await axios.get(`${API_URL}/api/users?populate[role]=*`);
    console.log('✅ Frontend query result:', frontendQueryResponse.data.length || 0);
    
    if (frontendQueryResponse.data.length > 0) {
      console.log('✅ Users with roles in frontend query:');
      const usersWithRoles = frontendQueryResponse.data.filter(user => user.role);
      const usersWithoutRoles = frontendQueryResponse.data.filter(user => !user.role);
      
      console.log(`   Users with roles: ${usersWithRoles.length}`);
      console.log(`   Users without roles: ${usersWithoutRoles.length}`);
      
      if (usersWithRoles.length > 0) {
        console.log('   Sample users with roles:');
        usersWithRoles.slice(0, 3).forEach((user, index) => {
          console.log(`     User ${index + 1}: ID=${user.id}, Role=${user.role?.name} (${user.role?.id})`);
        });
      }
      
      if (usersWithoutRoles.length > 0) {
        console.log('   Sample users without roles:');
        usersWithoutRoles.slice(0, 3).forEach((user, index) => {
          console.log(`     User ${index + 1}: ID=${user.id}, Role=${user.role}`);
        });
      }
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('All users with role populated:', allUsersResponse.data.length || 0);
    console.log('All users without role populated:', usersNoRoleResponse.data.length || 0);
    console.log('Authenticated users with role populated:', authUsersResponse.data.length || 0);
    console.log('Sellers with role populated:', sellersResponse.data.length || 0);
    console.log('Frontend query result:', frontendQueryResponse.data.length || 0);

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('==================');
    
    const frontendUsers = frontendQueryResponse.data || [];
    const usersWithRoles = frontendUsers.filter(user => user.role);
    const usersWithoutRoles = frontendUsers.filter(user => !user.role);
    
    if (usersWithoutRoles.length > 0) {
      console.log('⚠️  Some users don\'t have roles populated');
      console.log('   - This will cause client-side filtering to fail');
      console.log('   - Consider using server-side filtering instead');
    } else {
      console.log('✅ All users have roles populated');
      console.log('   - Client-side filtering should work');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserRolePopulation(); 