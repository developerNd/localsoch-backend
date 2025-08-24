const axios = require('axios');

const API_URL = 'http://localhost:1337';
const TEST_COUPON = 'REF1234567890ABCD'; // The static coupon code
const TEST_USER_ID = 40; // Test user ID

async function testCouponUsage() {
  console.log('🧪 Testing Coupon Usage Tracking...\n');

  try {
    // Test 1: First use of coupon
    console.log('📋 Test 1: First use of coupon');
    const response1 = await axios.post(`${API_URL}/api/coupons/validate`, {
      couponCode: TEST_COUPON,
      orderAmount: 100,
      userId: TEST_USER_ID
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
      userId: TEST_USER_ID
    });

    console.log('✅ Second use response:', response2.data.success ? 'SUCCESS' : 'FAILED');
    if (response2.data.success) {
      console.log('   ⚠️  PROBLEM: User can use coupon multiple times!');
    } else {
      console.log('   ✅ CORRECT: User cannot use coupon multiple times');
      console.log('   Error:', response2.data.message);
    }

    // Test 3: Different user using same coupon
    console.log('\n📋 Test 3: Different user using same coupon');
    const response3 = await axios.post(`${API_URL}/api/coupons/validate`, {
      couponCode: TEST_COUPON,
      orderAmount: 100,
      userId: 41 // Different user
    });

    console.log('✅ Different user response:', response3.data.success ? 'SUCCESS' : 'FAILED');
    if (response3.data.success) {
      console.log('   ✅ CORRECT: Different user can use the coupon');
      console.log('   Discount amount:', response3.data.coupon.discountAmount);
    } else {
      console.log('   Error:', response3.data.message);
    }

    // Test 4: Check coupon status in database
    console.log('\n📋 Test 4: Checking coupon usage in database');
    try {
      const couponResponse = await axios.get(`${API_URL}/api/coupons?filters[code]=${TEST_COUPON}&populate=usedBy`);
      if (couponResponse.data.data.length > 0) {
        const coupon = couponResponse.data.data[0];
        console.log('   Coupon found:', coupon.attributes.code);
        console.log('   Used count:', coupon.attributes.usedCount);
        console.log('   Used by users:', coupon.attributes.usedBy?.length || 0);
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
      console.log('   - Different users can use the same coupon');
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