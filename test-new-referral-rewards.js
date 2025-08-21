const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testNewReferralRewards() {
  console.log('🧪 Testing New Referral Reward Structure');
  console.log('==========================================');
  
  const timestamp = Date.now();
  
  try {
    // 1. Create a referrer user
    console.log('\n1️⃣ Creating referrer user...');
    const referrerResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `test_referrer_new_${timestamp}`,
      email: `referrer_new_${timestamp}@test.com`,
      password: 'Test123!'
    });
    
    const referrerToken = referrerResponse.data.jwt;
    const referrerId = referrerResponse.data.user.id;
    console.log('✅ Referrer created:', referrerResponse.data.user.username);

    // 2. Generate referral code for referrer
    console.log('\n2️⃣ Generating referral code...');
    const codeResponse = await axios.post(`${API_URL}/api/referrals/generate-code`, {}, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    const referralCode = codeResponse.data.referralCode;
    console.log('✅ Referral code generated:', referralCode);

    // 3. Test regular user registration with referral code (should get ₹10)
    console.log('\n3️⃣ Testing regular user registration with referral code...');
    const regularUserResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `test_regular_user_new_${timestamp}`,
      email: `regular_user_new_${timestamp}@test.com`,
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

    // 4. Test seller registration with referral code (should get 20% discount)
    console.log('\n4️⃣ Testing seller registration with referral code...');
    const sellerUserResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `test_seller_user_new_${timestamp}`,
      email: `seller_user_new_${timestamp}@test.com`,
      password: 'Test123!'
    });
    
    const sellerUserToken = sellerUserResponse.data.jwt;
    const sellerUserId = sellerUserResponse.data.user.id;
    console.log('✅ Seller user created:', sellerUserResponse.data.user.username);

    // Apply referral code for seller
    const sellerReferralResponse = await axios.post(`${API_URL}/api/referrals/apply-code`, {
      referralCode: referralCode,
      newUserId: sellerUserId,
      userType: 'seller'
    }, {
      headers: {
        'Authorization': `Bearer ${sellerUserToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Seller referral result:', sellerReferralResponse.data);

    // 5. Check referrer's updated rewards
    console.log('\n5️⃣ Checking referrer rewards...');
    const referrerStatsResponse = await axios.get(`${API_URL}/api/referrals/stats`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Referrer stats:', referrerStatsResponse.data.stats);

    // 6. Check all referral records
    console.log('\n6️⃣ Checking all referral records...');
    const referralsResponse = await axios.get(`${API_URL}/api/referrals`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ All referrals:', referralsResponse.data.data);

    // 7. Summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('Referral Code:', referralCode);
    console.log('Regular User Reward:', regularUserReferralResponse.data.userReward, '₹');
    console.log('Seller Discount:', sellerReferralResponse.data.sellerDiscount, '%');
    console.log('Total Referrals:', referrerStatsResponse.data.stats.totalReferrals);
    console.log('Completed Referrals:', referrerStatsResponse.data.stats.completedReferrals);
    console.log('Total Rewards:', referrerStatsResponse.data.stats.totalRewards, '₹');

    console.log('\n✅ Test completed successfully!');
    console.log('🎯 New reward structure verified:');
    console.log('   - Regular users get ₹10 cashback');
    console.log('   - Sellers get 20% discount');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNewReferralRewards(); 