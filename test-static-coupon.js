const axios = require('axios');

const API_BASE = 'http://localhost:1337';

async function testStaticCoupon() {
  try {
    console.log('🧪 Testing Static Coupon with User Field...\n');

    // Test 1: First user applying the static coupon
    console.log('1️⃣ Testing first user (ID: 1) with static coupon...');
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

    console.log('\n2️⃣ Testing second user (ID: 2) with same coupon...');
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

    console.log('\n3️⃣ Testing first user (ID: 1) trying to use same coupon again...');
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

    console.log('\n4️⃣ Testing third user (ID: 3) with same coupon...');
    const response4 = await axios.post(`${API_BASE}/api/coupons/validate`, {
      couponCode: 'REF1234567890ABCD',
      orderAmount: 1000,
      userId: 3
    });

    if (response4.data.success) {
      console.log('✅ Third user: Coupon applied successfully!');
      console.log(`   Discount: ${response4.data.coupon.discountPercentage}%`);
      console.log(`   Final Amount: ₹${response4.data.coupon.finalAmount}`);
    } else {
      console.log('❌ Third user failed:', response4.data.message);
    }

    console.log('\n🎉 Static coupon test completed!');
    console.log('📝 Summary: Each user should be able to use the coupon once, but not twice.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testStaticCoupon(); 