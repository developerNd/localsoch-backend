const axios = require('axios');

const API_URL = 'http://localhost:1337';
const TEST_COUPON = 'REF1234567890ABCD';

async function checkStaticCoupon() {
  console.log('🔍 Checking static coupon in database...\n');

  try {
    // Check if coupon exists
    console.log('📋 Checking if static coupon exists...');
    const response = await axios.get(`${API_URL}/api/coupons?filters[code]=${TEST_COUPON}&populate=usedBy`);
    
    if (response.data.data.length > 0) {
      const coupon = response.data.data[0];
      console.log('✅ Static coupon found!');
      console.log('   Code:', coupon.attributes.code);
      console.log('   Discount Percentage:', coupon.attributes.discountPercentage);
      console.log('   Min Order Amount:', coupon.attributes.minOrderAmount);
      console.log('   Usage Limit:', coupon.attributes.usageLimit);
      console.log('   Used Count:', coupon.attributes.usedCount);
      console.log('   Is Active:', coupon.attributes.isActive);
      console.log('   Used By Users:', coupon.attributes.usedBy?.length || 0);
      
      if (coupon.attributes.usedBy && coupon.attributes.usedBy.length > 0) {
        console.log('   Users who used this coupon:');
        coupon.attributes.usedBy.forEach(user => {
          console.log(`     - User ID: ${user.id}, Email: ${user.email}`);
        });
      }
    } else {
      console.log('❌ Static coupon not found in database');
      console.log('   You need to create the static coupon first');
    }

    // Test the simple endpoint
    console.log('\n📋 Testing simple endpoint...');
    try {
      const simpleResponse = await axios.get(`${API_URL}/api/coupons/test-simple`);
      console.log('✅ Simple endpoint working:', simpleResponse.data);
    } catch (error) {
      console.log('❌ Simple endpoint failed:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error checking coupon:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the check
checkStaticCoupon(); 