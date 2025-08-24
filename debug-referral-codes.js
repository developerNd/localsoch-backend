const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function debugReferralCodes() {
  console.log('🔍 Debugging Referral Codes');
  console.log('============================');

  try {
    // 1. Check what referral codes exist in the database
    console.log('\n1️⃣ Checking existing referral codes...');
    
    const referralResponse = await axios.get(`${API_URL}/api/referrals`);
    console.log('✅ Referral codes found:', referralResponse.data.data?.length || 0);
    
    if (referralResponse.data.data && referralResponse.data.data.length > 0) {
      console.log('📋 Existing referral codes:');
      referralResponse.data.data.forEach((referral, index) => {
        console.log(`   ${index + 1}. ${referral.referralCode} (Status: ${referral.status})`);
      });
    } else {
      console.log('❌ No referral codes found in database');
    }

    // 2. Test the specific code that's failing
    console.log('\n2️⃣ Testing the failing code: REF1234567890ABCD');
    
    try {
      const testResponse = await axios.post(`${API_URL}/api/coupons/test-referral`, {
        code: 'REF1234567890ABCD'
      });
      
      console.log('✅ Test response:', testResponse.data);
      
    } catch (error) {
      console.log('❌ Test failed:', error.response?.data?.message || error.message);
    }

    // 3. Generate a new referral code for testing
    console.log('\n3️⃣ Generating a new referral code for testing...');
    
    try {
      // First, let's create a test user
      const userResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
        username: `test_user_${Date.now()}`,
        email: `test_${Date.now()}@test.com`,
        password: 'Test123!'
      });
      
      const userToken = userResponse.data.jwt;
      const userId = userResponse.data.user.id;
      console.log('✅ Test user created:', userResponse.data.user.username);

      // Generate referral code
      const codeResponse = await axios.post(`${API_URL}/api/referrals/generate-code`, {}, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      const newReferralCode = codeResponse.data.referralCode;
      console.log('✅ New referral code generated:', newReferralCode);

      // Test the new code
      console.log('\n4️⃣ Testing the new referral code as coupon...');
      
      const couponResponse = await axios.post(`${API_URL}/api/coupons/validate`, {
        couponCode: newReferralCode,
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

      console.log('\n🎯 Use this referral code in your mobile app:');
      console.log(`   ${newReferralCode}`);

    } catch (error) {
      console.log('❌ Error generating test code:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

debugReferralCodes(); 