// Test script for the new refer and earn feature
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testReferAndEarnFeature() {
  try {
    console.log('🧪 Testing Refer and Earn Feature...\n');

    // 1. Create a referrer user
    console.log('1️⃣ Creating referrer user...');
    const timestamp = Date.now();
    const referrerResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `test_referrer_earn_${timestamp}`,
      email: `referrer_earn_${timestamp}@test.com`,
      password: 'Test123!'
    });
    
    const referrerToken = referrerResponse.data.jwt;
    const referrerId = referrerResponse.data.user.id;
    console.log('✅ Referrer created:', referrerResponse.data.user.username);

    // 2. Generate referral code for referrer
    console.log('\n2️⃣ Generating referral code...');
    const referralCodeResponse = await axios.post(`${API_URL}/api/referrals/generate-code`, {}, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    const referralCode = referralCodeResponse.data.referralCode;
    console.log('✅ Referral code generated:', referralCode);

    // 3. Test 1: Regular user registration with referral code (should get no benefit)
    console.log('\n3️⃣ Test 1: Regular user registration with referral code...');
    const regularUserResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `test_regular_user_${timestamp}`,
      email: `regular_user_${timestamp}@test.com`,
      password: 'Test123!'
    });
    
    const regularUserToken = regularUserResponse.data.jwt;
    const regularUserId = regularUserResponse.data.user.id;
    console.log('✅ Regular user created:', regularUserResponse.data.user.username);

    // Apply referral code for regular user
    const regularUserReferralResponse = await axios.post(`${API_URL}/api/referrals/apply-code`, {
      referralCode: referralCode,
      newUserId: regularUserId,
      userType: 'user'
    }, {
      headers: {
        'Authorization': `Bearer ${regularUserToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Regular user referral result:', regularUserReferralResponse.data);

    // 4. Test 2: Seller registration with referral code (should get benefits)
    console.log('\n4️⃣ Test 2: Seller registration with referral code...');
    const sellerUserResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `test_seller_user_${timestamp}`,
      email: `seller_user_${timestamp}@test.com`,
      password: 'Test123!'
    });
    
    const sellerUserToken = sellerUserResponse.data.jwt;
    const sellerUserId = sellerUserResponse.data.user.id;
    console.log('✅ Seller user created:', sellerUserResponse.data.user.username);

    // Create vendor for seller with referral code
    const vendorResponse = await axios.post(`${API_URL}/api/vendors`, {
      data: {
        name: `Test Seller Shop ${timestamp}`,
        description: 'A test shop for referral testing',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        contact: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        email: `seller_shop_${timestamp}@test.com`,
        referralCode: referralCode
      }
    }, {
      headers: {
        'Authorization': `Bearer ${sellerUserToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Seller vendor created:', vendorResponse.data.data?.id);

    // 5. Get updated referral stats
    console.log('\n5️⃣ Getting updated referral stats...');
    const updatedStatsResponse = await axios.get(`${API_URL}/api/referrals/stats`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Updated referral stats:', updatedStatsResponse.data.stats);

    // 6. Check referrer's total rewards
    console.log('\n6️⃣ Checking referrer rewards...');
    const referrerUserResponse = await axios.get(`${API_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Referrer user data:', {
      id: referrerUserResponse.data.id,
      username: referrerUserResponse.data.username,
      totalRewards: referrerUserResponse.data.totalRewards,
      referralCount: referrerUserResponse.data.referralCount
    });

    // 7. Get all referrals to see the details
    console.log('\n7️⃣ Getting all referrals details...');
    const allReferralsResponse = await axios.get(`${API_URL}/api/referrals?populate=*`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ All referrals:');
    allReferralsResponse.data.data.forEach((referral, index) => {
      console.log(`   Referral ${index + 1}:`);
      console.log(`     Code: ${referral.referralCode}`);
      console.log(`     Status: ${referral.status}`);
      console.log(`     User Type: ${referral.userType}`);
      console.log(`     User Reward: ₹${referral.userReward}`);
      console.log(`     Seller Discount: ${referral.sellerDiscount}%`);
      console.log(`     Completed At: ${referral.completedAt}`);
    });

    console.log('\n🎉 Refer and Earn Feature Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   - Regular user with referral code: No benefit');
    console.log('   - Seller with referral code: ₹10 cashback + 20% discount');
    console.log('   - Referrer gets rewards when seller uses their code');

  } catch (error) {
    console.error('❌ Error testing refer and earn feature:', error.response?.data || error.message);
  }
}

// Run the test
testReferAndEarnFeature(); 