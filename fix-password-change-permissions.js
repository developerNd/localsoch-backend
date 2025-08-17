const axios = require('axios');

const API_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@localsoch.com';
const ADMIN_PASSWORD = 'Admin@123';

async function fixPasswordChangePermissions() {
  try {
    console.log('🔧 Fixing password change permissions...');
    
    // Step 1: Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const { jwt } = loginResponse.data;
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Admin login successful');
    
    // Step 2: Get the authenticated role (usually role ID 1)
    console.log('📋 Fetching authenticated role...');
    const authenticatedRoleResponse = await axios.get(`${API_URL}/api/users-permissions/roles/1`, { headers });
    const authenticatedRole = authenticatedRoleResponse.data;
    
    console.log('✅ Authenticated role fetched');
    
    // Step 3: Update the permissions to include custom user controller methods
    const updatedPermissions = {
      ...authenticatedRole.permissions,
      
      // Update user permissions to include custom methods
      'plugin::users-permissions.user': {
        ...authenticatedRole.permissions['plugin::users-permissions.user'],
        controllers: {
          ...authenticatedRole.permissions['plugin::users-permissions.user']?.controllers,
          'user': {
            ...authenticatedRole.permissions['plugin::users-permissions.user']?.controllers?.user,
            me: { enabled: true, policy: '' },
            update: { enabled: true, policy: '' },
            changePassword: { enabled: true, policy: '' },
            forgotPassword: { enabled: true, policy: '' },
            resetPassword: { enabled: true, policy: '' }
          }
        }
      },
      
      // Also ensure auth permissions are enabled
      'plugin::users-permissions.auth': {
        ...authenticatedRole.permissions['plugin::users-permissions.auth'],
        controllers: {
          ...authenticatedRole.permissions['plugin::users-permissions.auth']?.controllers,
          'auth': {
            ...authenticatedRole.permissions['plugin::users-permissions.auth']?.controllers?.auth,
            changePassword: { enabled: true, policy: '' },
            forgotPassword: { enabled: true, policy: '' },
            resetPassword: { enabled: true, policy: '' }
          }
        }
      }
    };
    
    // Step 4: Update the authenticated role
    console.log('🔄 Updating authenticated role permissions...');
    const updateResponse = await axios.put(`${API_URL}/api/users-permissions/roles/1`, {
      ...authenticatedRole,
      permissions: updatedPermissions
    }, { headers });
    
    console.log('✅ Authenticated role permissions updated successfully!');
    console.log('🎉 Password change permissions are now enabled!');
    
    // Step 5: Test the endpoint
    console.log('🧪 Testing password change endpoint...');
    try {
      const testResponse = await axios.post(`${API_URL}/api/users-permissions/auth/change-password`, {
        currentPassword: 'test',
        newPassword: 'test123'
      }, { headers });
      console.log('❌ Test should have failed with 400 (wrong password), but got:', testResponse.status);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Password change endpoint is working (400 is expected for wrong password)');
      } else if (error.response?.status === 403) {
        console.log('❌ Still getting 403 - permissions not updated correctly');
      } else {
        console.log('⚠️ Unexpected response:', error.response?.status);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error.response?.data || error.message);
    return false;
  }
}

fixPasswordChangePermissions().then(success => {
  if (success) {
    console.log('🎉 Password change permission setup completed!');
    console.log('🔧 You can now change passwords from the frontend.');
  } else {
    console.log('💥 Password change permission setup failed.');
  }
}); 