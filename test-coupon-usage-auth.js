const axios = require('axios');

const API_URL = 'http://localhost:1337';
const TEST_COUPON = 'REF1234567890ABCD'; // The static coupon code
const TEST_USER_EMAIL = 'test@gmail.com'; // Test user email
const TEST_USER_PASSWORD = 'password123'; // Test user password

async function getAuthToken() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    return response.data.jwt;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCouponUsage() {
  console.log('🧪 Testing Coupon Usage Tracking with Authentication...\n');

  try {
    // Get authentication token
    console.log('🔐 Getting authentication token...');
    const token = await getAuthToken();
    if (!token) {
      console.log('❌ Cannot proceed without authentication token');
      return;
    }
    console.log('✅ Authentication successful\n');

    // Get user ID from token
    const userResponse = await axios.get(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userId = userResponse.data.id;
    console.log('👤 User ID:', userId);

    // Test 1: First use of coupon
    console.log('\n📋 Test 1: First use of coupon');
    const response1 = await axios.post(`${API_URL}/api/coupons/validate`, {
      couponCode: TEST_COUPON,
      orderAmount: 100,
      userId: userId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ First use response:', response1.data.success ? 'SUCCESS' : 'FAILED');
    if (response1.data.success) {
      console.log('   Discount amount:', response1.data.coupon.discountAmount);
    } else {
      console.log('   Error:', response1.data.message);
    }

    // Test 2: Second use of same coupon by same user
    console.log('\n📋 Test 2: Second use of same coupon by same user');
    const response2 = await axios.post(`${API_URL}/api/coupons/validate`, {
      couponCode: TEST_COUPON,
      orderAmount: 100,
      userId: userId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Second use response:', response2.data.success ? 'SUCCESS' : 'FAILED');
    if (response2.data.success) {
      console.log('   ⚠️  PROBLEM: User can use coupon multiple times!');
    } else {
      console.log('   ✅ CORRECT: User cannot use coupon multiple times');
      console.log('   Error:', response2.data.message);
    }

    // Test 3: Check coupon status in database
    console.log('\n📋 Test 3: Checking coupon usage in database');
    try {
      const couponResponse = await axios.get(`${API_URL}/api/coupons?filters[code]=${TEST_COUPON}&populate=usedBy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (couponResponse.data.data.length > 0) {
        const coupon = couponResponse.data.data[0];
        console.log('   Coupon found:', coupon.attributes.code);
        console.log('   Used count:', coupon.attributes.usedCount);
        console.log('   Used by users:', coupon.attributes.usedBy?.length || 0);
        if (coupon.attributes.usedBy && coupon.attributes.usedBy.length > 0) {
          console.log('   Users who used this coupon:');
          coupon.attributes.usedBy.forEach(user => {
            console.log(`     - User ID: ${user.id}, Email: ${user.email}`);
          });
        }
      } else {
        console.log('   No coupon found in database');
      }
    } catch (error) {
      console.log('   Error checking database:', error.message);
    }

    console.log('\n🎯 Test Summary:');
    if (!response2.data.success) {
      console.log('✅ SUCCESS: Coupon usage tracking is working correctly!');
      console.log('   - Users cannot use the same coupon multiple times');
    } else {
      console.log('❌ FAILED: Coupon usage tracking is not working!');
      console.log('   - Users can use the same coupon multiple times');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCouponUsage(); 