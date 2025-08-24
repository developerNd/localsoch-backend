const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testCouponSystem() {
  console.log('🧪 Testing Coupon System');
  console.log('========================');
  
  const timestamp = Date.now();
  
  try {
    // 1. Create a test user
    console.log('\n1️⃣ Creating test user...');
    const userResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `test_user_coupon_${timestamp}`,
      email: `test_coupon_${timestamp}@test.com`,
      password: 'Test123!'
    });
    
    const userToken = userResponse.data.jwt;
    const userId = userResponse.data.user.id;
    console.log('✅ Test user created:', userResponse.data.user.username);

    // 2. Generate referral code
    console.log('\n2️⃣ Generating referral code...');
    const codeResponse = await axios.post(`${API_URL}/api/referrals/generate-code`, {}, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    const referralCode = codeResponse.data.referralCode;
    console.log('✅ Referral code generated:', referralCode);

    // 3. Test coupon validation with referral code
    console.log('\n3️⃣ Testing coupon validation...');
    const couponResponse = await axios.post(`${API_URL}/api/coupons/validate`, {
      couponCode: referralCode,
      orderAmount: 500,
      userId: userId
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Coupon validation response:', couponResponse.data);

    // 4. Test with invalid coupon code
    console.log('\n4️⃣ Testing invalid coupon code...');
    try {
      const invalidResponse = await axios.post(`${API_URL}/api/coupons/validate`, {
        couponCode: 'INVALID123',
        orderAmount: 500,
        userId: userId
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('❌ Should have failed but got:', invalidResponse.data);
    } catch (error) {
      console.log('✅ Invalid coupon correctly rejected:', error.response?.data?.message);
    }

    // 5. Test referral code lookup
    console.log('\n5️⃣ Testing referral code lookup...');
    const testResponse = await axios.post(`${API_URL}/api/coupons/test-referral`, {
      code: referralCode
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Referral code test response:', testResponse.data);

    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCouponSystem(); 