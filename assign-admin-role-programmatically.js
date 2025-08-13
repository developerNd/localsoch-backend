const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function assignAdminRoleProgrammatically() {
  try {
    console.log('👑 Assigning admin role to user ID 4...');
    
    // Step 1: Login with super admin
    console.log('\n🔐 Step 1: Logging in with super admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Super admin login successful!');
    console.log('🆔 User ID:', loginResponse.data.user.id);
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Check current user role
    console.log('\n👤 Step 2: Checking current user role...');
    try {
      const userResponse = await axios.get(`${API_URL}/api/users/me`, { headers });
      console.log('✅ User info accessible');
      console.log('   - ID:', userResponse.data.id);
      console.log('   - Username:', userResponse.data.username);
      console.log('   - Email:', userResponse.data.email);
      console.log('   - Role:', userResponse.data.role?.name || 'No role assigned');
      console.log('   - Role ID:', userResponse.data.role?.id || 'No role ID');
    } catch (error) {
      console.log('❌ User info not accessible:', error.response?.status);
    }
    
    // Step 3: Try to assign admin role to user ID 4
    console.log('\n🔧 Step 3: Assigning admin role to user ID 4...');
    try {
      const updateResponse = await axios.put(`${API_URL}/api/users/4`, {
        role: 3 // admin role ID
      }, { headers });
      
      console.log('✅ Admin role assigned successfully!');
      console.log('Updated user:', updateResponse.data);
      
    } catch (error) {
      console.log('❌ Error assigning admin role:', error.response?.data || error.message);
      
      // Try alternative approach - get all users and update
      console.log('\n🔄 Trying alternative approach...');
      try {
        const usersResponse = await axios.get(`${API_URL}/api/users`, { headers });
        console.log('Available users:', usersResponse.data.length);
        
        for (const user of usersResponse.data) {
          console.log(`User ${user.id}: ${user.email} - Role: ${user.role?.name || 'No role'}`);
        }
        
        // Try to update user ID 4 specifically
        const updateUserResponse = await axios.put(`${API_URL}/api/users/4`, {
          role: 3
        }, { headers });
        
        console.log('✅ User updated successfully!');
        
      } catch (altError) {
        console.log('❌ Alternative approach failed:', altError.response?.data || altError.message);
      }
    }
    
    // Step 4: Verify the role assignment
    console.log('\n✅ Step 4: Verifying role assignment...');
    try {
      const verifyResponse = await axios.get(`${API_URL}/api/users/me`, { headers });
      console.log('✅ Verification successful');
      console.log('   - ID:', verifyResponse.data.id);
      console.log('   - Username:', verifyResponse.data.username);
      console.log('   - Email:', verifyResponse.data.email);
      console.log('   - Role:', verifyResponse.data.role?.name || 'No role assigned');
      console.log('   - Role ID:', verifyResponse.data.role?.id || 'No role ID');
      
      if (verifyResponse.data.role?.id) {
        console.log('🎉 Admin role successfully assigned!');
        return true;
      } else {
        console.log('❌ Admin role still not assigned');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Verification failed:', error.response?.status);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error during role assignment:', error.response?.data || error.message);
    return false;
  }
}

// Run the script
assignAdminRoleProgrammatically().then(success => {
  if (success) {
    console.log('\n🎉 Admin role assignment completed!');
    console.log('🔧 You can now run the setup script to configure permissions and seed data.');
  } else {
    console.log('\n💥 Admin role assignment failed.');
    console.log('🔧 Please assign the admin role manually through the admin panel.');
  }
}); 