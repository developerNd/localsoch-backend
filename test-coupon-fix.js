const axios = require('axios');

const API_BASE = 'http://localhost:1337';

async function testCouponValidation() {
  try {
    console.log('🧪 Testing Coupon Validation Fix...\n');

    // Test 1: First user applying the static coupon
    console.log('1️⃣ Testing first user with static coupon...');
    const response1 = await axios.post(`${API_BASE}/api/coupons/validate`, {
      couponCode: 'REF1234567890ABCD',
      orderAmount: 1000,
      userId: 1
    });

    if (response1.data.success) {
      console.log('✅ First user: Coupon applied successfully!');
      console.log(`   Discount: ${response1.data.coupon.discountPercentage}%`);
      console.log(`   Final Amount: ₹${response1.data.coupon.finalAmount}`);
    } else {
      console.log('❌ First user failed:', response1.data.message);
    }

    console.log('\n2️⃣ Testing second user with same coupon...');
    const response2 = await axios.post(`${API_BASE}/api/coupons/validate`, {
      couponCode: 'REF1234567890ABCD',
      orderAmount: 1000,
      userId: 2
    });

    if (response2.data.success) {
      console.log('✅ Second user: Coupon applied successfully!');
      console.log(`   Discount: ${response2.data.coupon.discountPercentage}%`);
      console.log(`   Final Amount: ₹${response2.data.coupon.finalAmount}`);
    } else {
      console.log('❌ Second user failed:', response2.data.message);
    }

    console.log('\n3️⃣ Testing first user trying to use same coupon again...');
    const response3 = await axios.post(`${API_BASE}/api/coupons/validate`, {
      couponCode: 'REF1234567890ABCD',
      orderAmount: 1000,
      userId: 1
    });

    if (response3.data.success) {
      console.log('❌ First user should not be able to use coupon again!');
    } else {
      console.log('✅ First user correctly blocked from reusing coupon:', response3.data.message);
    }

    console.log('\n🎉 Coupon validation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCouponValidation(); 