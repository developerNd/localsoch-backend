const axios = require('axios');

const API_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

const headers = {
  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testPermissions() {
  console.log('🧪 Testing banner and featured product permissions...');

  try {
    // Test banner API
    console.log('\n📋 Testing Banner API...');
    const bannerResponse = await axios.get(`${API_URL}/api/banners?populate=image`, { headers });
    console.log('✅ Banner API - Status:', bannerResponse.status);
    console.log('✅ Banner API - Count:', bannerResponse.data.data?.length || 0);

    // Test featured products API
    console.log('\n⭐ Testing Featured Products API...');
    const featuredResponse = await axios.get(`${API_URL}/api/featured-products?populate=product`, { headers });
    console.log('✅ Featured Products API - Status:', featuredResponse.status);
    console.log('✅ Featured Products API - Count:', featuredResponse.data.data?.length || 0);

    // Test products API (for featured products selection)
    console.log('\n📦 Testing Products API...');
    const productsResponse = await axios.get(`${API_URL}/api/products?populate=image`, { headers });
    console.log('✅ Products API - Status:', productsResponse.status);
    console.log('✅ Products API - Count:', productsResponse.data.data?.length || 0);

    console.log('\n🎉 All API tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Login to your admin panel');
    console.log('2. Navigate to Banners or Featured Products');
    console.log('3. The APIs should now work with user authentication');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPermissions(); 