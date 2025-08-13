const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testUserAuth() {
  console.log('🧪 Testing user authentication...');

  try {
    // Test login with admin credentials
    console.log('\n🔐 Testing login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@example.com',
      password: 'admin123'
    });

    console.log('✅ Login successful');
    const { jwt, user } = loginResponse.data;
    console.log('✅ User ID:', user.id);
    console.log('✅ User role:', user.role?.name || 'No role');

    // Test user/me endpoint
    console.log('\n👤 Testing /api/users/me endpoint...');
    const meResponse = await axios.get(`${API_URL}/api/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    console.log('✅ /api/users/me successful');
    console.log('✅ User data:', {
      id: meResponse.data.id,
      username: meResponse.data.username,
      email: meResponse.data.email,
      role: meResponse.data.role?.name
    });

    // Test banner API with user token
    console.log('\n📋 Testing Banner API with user token...');
    const bannerResponse = await axios.get(`${API_URL}/api/banners?populate=image`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    console.log('✅ Banner API - Status:', bannerResponse.status);
    console.log('✅ Banner API - Count:', bannerResponse.data.data?.length || 0);

    // Test featured products API with user token
    console.log('\n⭐ Testing Featured Products API with user token...');
    const featuredResponse = await axios.get(`${API_URL}/api/featured-products?populate=product`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    console.log('✅ Featured Products API - Status:', featuredResponse.status);
    console.log('✅ Featured Products API - Count:', featuredResponse.data.data?.length || 0);

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📝 The admin panel should now work correctly:');
    console.log('1. Login should succeed');
    console.log('2. User data should load');
    console.log('3. Banner and Featured Product pages should work');
    console.log('4. No more redirect loops to login page');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('❌ Status:', error.response?.status);
  }
}

testUserAuth(); 