const axios = require('axios');

const API_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@cityshopping.com';
const ADMIN_PASSWORD = 'admin123';
const COUPON_CODE = 'REF1234567890ABCD';

async function getAdminToken() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    return response.data.jwt;
  } catch (error) {
    console.error('❌ Admin authentication failed:', error.response?.data || error.message);
    return null;
  }
}

async function createStaticCoupon() {
  console.log('🔧 Creating static coupon...\n');

  try {
    // Get admin token
    console.log('🔐 Getting admin authentication token...');
    const token = await getAdminToken();
    if (!token) {
      console.log('❌ Cannot proceed without admin token');
      return;
    }
    console.log('✅ Admin authentication successful\n');

    // Check if coupon already exists
    console.log('📋 Checking if coupon already exists...');
    try {
      const existingResponse = await axios.get(`${API_URL}/api/coupons?filters[code]=${COUPON_CODE}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (existingResponse.data.data.length > 0) {
        console.log('✅ Static coupon already exists!');
        const coupon = existingResponse.data.data[0];
        console.log('   Code:', coupon.attributes.code);
        console.log('   Used Count:', coupon.attributes.usedCount);
        console.log('   Is Active:', coupon.attributes.isActive);
        return;
      }
    } catch (error) {
      console.log('   No existing coupon found or error checking');
    }

    // Create the static coupon
    console.log('📋 Creating static coupon...');
    const couponData = {
      data: {
        code: COUPON_CODE,
        discountPercentage: 20,
        minOrderAmount: 100,
        usageLimit: 1000, // Allow many users to use this coupon
        usedCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        couponType: 'referral',
        description: '20% off on your first order using referral code - Static coupon for all users',
        publishedAt: new Date()
      }
    };

    const createResponse = await axios.post(`${API_URL}/api/coupons`, couponData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Static coupon created successfully!');
    console.log('   ID:', createResponse.data.data.id);
    console.log('   Code:', createResponse.data.data.attributes.code);
    console.log('   Discount Percentage:', createResponse.data.data.attributes.discountPercentage);
    console.log('   Usage Limit:', createResponse.data.data.attributes.usageLimit);

  } catch (error) {
    console.error('❌ Error creating coupon:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the script
createStaticCoupon(); 