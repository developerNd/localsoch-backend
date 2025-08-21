const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testUserRoles() {
  console.log('🧪 Testing User Roles for Admin Notifications');
  console.log('=============================================');
  
  try {
    // 1. Check all roles in the system
    console.log('\n1️⃣ Checking all roles in the system...');
    const rolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`);
    
    console.log('✅ Available roles:');
    rolesResponse.data.roles.forEach(role => {
      console.log(`   ID: ${role.id}, Name: ${role.name}, Type: ${role.type}`);
    });

    // 2. Check users with different roles
    console.log('\n2️⃣ Checking users by roles...');
    
    // Check all users
    const allUsersResponse = await axios.get(`${API_URL}/api/users?populate=*`);
    console.log(`✅ Total users: ${allUsersResponse.data.length || 0}`);
    
    // Check authenticated users (role ID 1)
    const authUsersResponse = await axios.get(`${API_URL}/api/users?populate=*&filters[role][id][$eq]=1`);
    console.log(`✅ Authenticated users (role ID 1): ${authUsersResponse.data.length || 0}`);
    
    // Check sellers (role ID 4)
    const sellersResponse = await axios.get(`${API_URL}/api/users?populate=*&filters[role][id][$eq]=4`);
    console.log(`✅ Sellers (role ID 4): ${sellersResponse.data.length || 0}`);
    
    // Check admin users (role ID 3)
    const adminUsersResponse = await axios.get(`${API_URL}/api/users?populate=*&filters[role][id][$eq]=3`);
    console.log(`✅ Admin users (role ID 3): ${adminUsersResponse.data.length || 0}`);

    // 3. Check users without role filter
    console.log('\n3️⃣ Checking users without role filter...');
    const usersResponse = await axios.get(`${API_URL}/api/users?populate=*`);
    console.log(`✅ Users without role filter: ${usersResponse.data.length || 0}`);
    
    if (usersResponse.data.length > 0) {
      console.log('✅ Sample users:');
      usersResponse.data.slice(0, 5).forEach(user => {
        console.log(`   ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role?.name || 'No role'}`);
      });
    }

    // 4. Check if there are users with role populated
    console.log('\n4️⃣ Checking users with role details...');
    const usersWithRoleResponse = await axios.get(`${API_URL}/api/users?populate[role]=*`);
    console.log(`✅ Users with role details: ${usersWithRoleResponse.data.length || 0}`);
    
    if (usersWithRoleResponse.data.length > 0) {
      console.log('✅ Users with roles:');
      usersWithRoleResponse.data.slice(0, 5).forEach(user => {
        console.log(`   ID: ${user.id}, Username: ${user.username}, Role: ${user.role?.name || 'No role'} (ID: ${user.role?.id || 'N/A'})`);
      });
    }

    // 5. Test the specific query used in admin notifications
    console.log('\n5️⃣ Testing admin notification queries...');
    
    // Test authenticated users query
    try {
      const authQueryResponse = await axios.get(`${API_URL}/api/users?populate=*&filters[role][id][$eq]=1`);
      console.log(`✅ Authenticated users query result: ${authQueryResponse.data.length || 0} users`);
    } catch (error) {
      console.log('❌ Authenticated users query failed:', error.response?.data || error.message);
    }
    
    // Test sellers query
    try {
      const sellersQueryResponse = await axios.get(`${API_URL}/api/users?populate=*&filters[role][id][$eq]=4`);
      console.log(`✅ Sellers query result: ${sellersQueryResponse.data.length || 0} users`);
    } catch (error) {
      console.log('❌ Sellers query failed:', error.response?.data || error.message);
    }

    // 6. Summary and recommendations
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('Available roles:', rolesResponse.data.roles.map(r => `${r.name} (ID: ${r.id})`).join(', '));
    console.log('Total users:', allUsersResponse.data.length || 0);
    console.log('Authenticated users:', authUsersResponse.data.length || 0);
    console.log('Sellers:', sellersResponse.data.length || 0);
    console.log('Admin users:', adminUsersResponse.data.length || 0);

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('==================');
    
    if (authUsersResponse.data.length === 0) {
      console.log('⚠️  No authenticated users found with role ID 1');
      console.log('   - Check if role ID 1 is correct for authenticated users');
      console.log('   - Consider using role name instead of ID');
    }
    
    if (sellersResponse.data.length === 0) {
      console.log('⚠️  No sellers found with role ID 4');
      console.log('   - Check if role ID 4 is correct for sellers');
      console.log('   - Consider using role name instead of ID');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserRoles(); 