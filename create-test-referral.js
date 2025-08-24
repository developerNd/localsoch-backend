const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function createTestReferral() {
  console.log('🧪 Creating Test Referral Code');
  console.log('==============================');

  try {
    // 1. Create a test user
    console.log('\n1️⃣ Creating test user...');
    const userResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!'
    });
    
    const userToken = userResponse.data.jwt;
    const userId = userResponse.data.user.id;
    console.log('✅ Test user created:', userResponse.data.user.username);

    // 2. Try to generate referral code
    console.log('\n2️⃣ Generating referral code...');
    
    try {
      const codeResponse = await axios.post(`${API_URL}/api/referrals/generate-code`, {}, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Referral code generated successfully!');
      console.log('Referral code:', codeResponse.data.referralCode);
      
      // 3. Test the referral code as coupon
      console.log('\n3️⃣ Testing referral code as coupon...');
      
      const couponResponse = await axios.post(`${API_URL}/api/coupons/validate`, {
        couponCode: codeResponse.data.referralCode,
        orderAmount: 100,
        userId: userId
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Coupon validation successful!');
      console.log('Response:', couponResponse.data);
      
      console.log('\n🎯 SUCCESS! Use this referral code in your mobile app:');
      console.log(`   ${codeResponse.data.referralCode}`);
      
    } catch (error) {
      console.log('❌ Error generating referral code:', error.response?.data?.message || error.message);
      console.log('Full error:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

createTestReferral(); 