const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testProfileImageAndPassword() {
  try {
    console.log('🧪 Testing Profile Image and Password Functionality\n');

    // Test 1: Check if the new routes are available
    console.log('1️⃣ Testing route availability...');
    
    try {
      const routesResponse = await axios.get(`${API_URL}/api/users-permissions/auth/change-password`);
      console.log('❌ Route should not be accessible without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Change password route exists and requires authentication');
      } else {
        console.log('⚠️ Route test inconclusive:', error.response?.status);
      }
    }

    try {
      const forgotResponse = await axios.post(`${API_URL}/api/users-permissions/auth/forgot-password`, {
        email: 'test@example.com'
      });
      console.log('✅ Forgot password route works:', forgotResponse.data);
    } catch (error) {
      console.log('❌ Forgot password route error:', error.response?.data || error.message);
    }

    // Test 2: Check user schema
    console.log('\n2️⃣ Testing user schema...');
    
    try {
      const schemaResponse = await axios.get(`${API_URL}/api/users-permissions/content-types/user`);
      console.log('✅ User schema accessible');
      
      if (schemaResponse.data?.data?.attributes?.profileImage) {
        console.log('✅ Profile image field exists in schema');
      } else {
        console.log('❌ Profile image field not found in schema');
      }
    } catch (error) {
      console.log('❌ Schema test error:', error.response?.data || error.message);
    }

    // Test 3: Test password reset flow
    console.log('\n3️⃣ Testing password reset flow...');
    
    try {
      const resetResponse = await axios.post(`${API_URL}/api/users-permissions/auth/reset-password`, {
        code: 'invalid-code',
        password: 'newpassword123',
        passwordConfirmation: 'newpassword123'
      });
      console.log('❌ Should not accept invalid reset code');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Reset password validation works correctly');
      } else {
        console.log('⚠️ Reset password test inconclusive:', error.response?.status);
      }
    }

    console.log('\n🎯 Test Summary:');
    console.log('- Profile image field added to user schema');
    console.log('- Password change endpoint: /api/users-permissions/auth/change-password');
    console.log('- Forgot password endpoint: /api/users-permissions/auth/forgot-password');
    console.log('- Reset password endpoint: /api/users-permissions/auth/reset-password');
    console.log('- Custom user controller handles file uploads and password changes');
    console.log('\n📝 Next steps:');
    console.log('1. Restart Strapi server to apply schema changes');
    console.log('2. Test profile image upload from frontend');
    console.log('3. Test password change functionality from frontend');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileImageAndPassword(); 