// Debug script to check admin users
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function debugAdminUsers() {
  try {
    console.log('🔍 Debugging Admin Users...\n');

    // Test 1: Get all users
    console.log('1️⃣ Getting all users...');
    try {
      const usersResponse = await axios.get(`${API_URL}/api/users?populate=*`);
      console.log('✅ Users endpoint accessible');
      console.log('📊 Total users:', usersResponse.data.length || 0);
      
      if (usersResponse.data && usersResponse.data.length > 0) {
        console.log('👥 Users found:');
        usersResponse.data.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.username || user.email} (Role: ${user.role?.name || 'No role'})`);
        });
      }
    } catch (error) {
      console.log('❌ Users endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 2: Get roles
    console.log('\n2️⃣ Getting roles...');
    try {
      const rolesResponse = await axios.get(`${API_URL}/api/users-permissions/roles`);
      console.log('✅ Roles endpoint accessible');
      console.log('📊 Available roles:');
      
      if (rolesResponse.data && rolesResponse.data.roles) {
        Object.keys(rolesResponse.data.roles).forEach(roleName => {
          const role = rolesResponse.data.roles[roleName];
          console.log(`  - ${roleName}: ID ${role.id}, Users: ${role.users?.length || 0}`);
        });
      }
    } catch (error) {
      console.log('❌ Roles endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 3: Check if admin role exists
    console.log('\n3️⃣ Checking admin role...');
    try {
      const adminRoleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/3`);
      console.log('✅ Admin role found:', adminRoleResponse.data.role.name);
      console.log('👥 Admin users:', adminRoleResponse.data.role.users?.length || 0);
    } catch (error) {
      console.log('❌ Admin role not found or accessible');
    }

    console.log('\n🎯 Debug Complete!');
    console.log('\n📋 Summary:');
    console.log('- Check if admin users exist');
    console.log('- Verify admin role is properly configured');
    console.log('- Ensure notification service can find admin users');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugAdminUsers(); 