const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testPasswordChange() {
  try {
    console.log('🧪 Testing password change functionality...');
    
    // Step 1: Login as a test user
    console.log('\n1️⃣ Logging in as test user...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'test@gmail.com',
      password: 'test123'
    });
    
    const { jwt } = loginResponse.data;
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Login successful');
    console.log('🔍 User ID:', loginResponse.data.user.id);
    
    // Step 2: Test password change
    console.log('\n2️⃣ Testing password change...');
    
    try {
      const changeResponse = await axios.post(`${API_URL}/api/auth/change-password`, {
        currentPassword: 'test123',
        newPassword: 'newpassword123'
      }, { headers });
      
      console.log('✅ Password change successful!');
      console.log('Response:', changeResponse.data);
      
    } catch (error) {
      console.log('❌ Password change failed');
      console.log('Status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      
      if (error.response?.data?.error?.details?.errors) {
        console.log('Validation errors:');
        error.response.data.error.details.errors.forEach((err, index) => {
          console.log(`  ${index + 1}. ${err.message}`);
        });
      }
    }
    
    // Step 3: Test with wrong current password
    console.log('\n3️⃣ Testing with wrong current password...');
    
    try {
      const wrongResponse = await axios.post(`${API_URL}/api/auth/change-password`, {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      }, { headers });
      
      console.log('❌ Should have failed with wrong password');
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected wrong password');
        console.log('Error message:', error.response.data.error?.message);
      } else {
        console.log('⚠️ Unexpected response for wrong password:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPasswordChange(); 