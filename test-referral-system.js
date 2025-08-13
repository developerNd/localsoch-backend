const axios = require('axios');

const API_URL = 'http://localhost:1337';

// Test the referral system
async function testReferralSystem() {
  try {
    console.log('🧪 Testing Referral System...\n');

    // 1. Create a test user (referrer)
    console.log('1. Creating referrer user...');
    const referrerResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: 'test_referrer',
      email: 'referrer@test.com',
      password: 'Test123!'
    });
    
    const referrerToken = referrerResponse.data.jwt;
    const referrerId = referrerResponse.data.user.id;
    console.log('✅ Referrer created:', referrerResponse.data.user.username);

    // 2. Generate referral code for referrer
    console.log('\n2. Generating referral code...');
    const referralCodeResponse = await axios.post(`${API_URL}/api/referrals/generate-code`, {}, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    const referralCode = referralCodeResponse.data.referralCode;
    console.log('✅ Referral code generated:', referralCode);

    // 3. Get referral stats for referrer
    console.log('\n3. Getting referral stats...');
    const statsResponse = await axios.get(`${API_URL}/api/referrals/stats`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Referral stats:', statsResponse.data.stats);

    // 4. Validate the referral code
    console.log('\n4. Validating referral code...');
    const validateResponse = await axios.post(`${API_URL}/api/referrals/validate-code`, {
      referralCode: referralCode
    }, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Referral code validation:', validateResponse.data);

    // 5. Create a referred user
    console.log('\n5. Creating referred user...');
    const referredResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: 'test_referred',
      email: 'referred@test.com',
      password: 'Test123!'
    });
    
    const referredToken = referredResponse.data.jwt;
    const referredId = referredResponse.data.user.id;
    console.log('✅ Referred user created:', referredResponse.data.user.username);

    // 6. Apply referral code for the new user
    console.log('\n6. Applying referral code...');
    const applyResponse = await axios.post(`${API_URL}/api/referrals/apply-code`, {
      referralCode: referralCode,
      newUserId: referredId
    }, {
      headers: {
        'Authorization': `Bearer ${referredToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Referral code applied:', applyResponse.data);

    // 7. Get updated referral stats
    console.log('\n7. Getting updated referral stats...');
    const updatedStatsResponse = await axios.get(`${API_URL}/api/referrals/stats`, {
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Updated referral stats:', updatedStatsResponse.data.stats);

    console.log('\n🎉 Referral system test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing referral system:', error.response?.data || error.message);
  }
}

// Run the test
testReferralSystem(); 