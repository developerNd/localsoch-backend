const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testAdminNotificationUsers() {
  console.log('🧪 Testing Admin Notification User Fetching');
  console.log('===========================================');
  
  try {
    // Test the exact API calls used in the frontend
    console.log('\n1️⃣ Testing frontend API calls...');
    
    // Test all users
    console.log('\n📋 Testing /api/users?populate=*');
    const allUsersResponse = await axios.get(`${API_URL}/api/users?populate=*`);
    console.log('✅ Response status:', allUsersResponse.status);
    console.log('✅ Response type:', typeof allUsersResponse.data);
    console.log('✅ Is array:', Array.isArray(allUsersResponse.data));
    console.log('✅ Has data property:', !!allUsersResponse.data.data);
    console.log('✅ Users count:', allUsersResponse.data.length || allUsersResponse.data.data?.length || 0);
    
    if (allUsersResponse.data.data) {
      console.log('✅ First user:', {
        id: allUsersResponse.data.data[0]?.id,
        username: allUsersResponse.data.data[0]?.username,
        email: allUsersResponse.data.data[0]?.email,
        role: allUsersResponse.data.data[0]?.role?.name
      });
    }

    // Test authenticated users by role name
    console.log('\n📋 Testing /api/users?populate[role]=*&filters[role][name][$eq]=authenticated');
    const authUsersResponse = await axios.get(`${API_URL}/api/users?populate[role]=*&filters[role][name][$eq]=authenticated`);
    console.log('✅ Response status:', authUsersResponse.status);
    console.log('✅ Response type:', typeof authUsersResponse.data);
    console.log('✅ Is array:', Array.isArray(authUsersResponse.data));
    console.log('✅ Has data property:', !!authUsersResponse.data.data);
    console.log('✅ Authenticated users count:', authUsersResponse.data.length || authUsersResponse.data.data?.length || 0);

    // Test sellers by role name
    console.log('\n📋 Testing /api/users?populate[role]=*&filters[role][name][$eq]=seller');
    const sellersResponse = await axios.get(`${API_URL}/api/users?populate[role]=*&filters[role][name][$eq]=seller`);
    console.log('✅ Response status:', sellersResponse.status);
    console.log('✅ Response type:', typeof sellersResponse.data);
    console.log('✅ Is array:', Array.isArray(sellersResponse.data));
    console.log('✅ Has data property:', !!sellersResponse.data.data);
    console.log('✅ Sellers count:', sellersResponse.data.length || sellersResponse.data.data?.length || 0);

    // Test authenticated users by role ID
    console.log('\n📋 Testing /api/users?populate=*&filters[role][id][$eq]=1');
    const authUsersByIdResponse = await axios.get(`${API_URL}/api/users?populate=*&filters[role][id][$eq]=1`);
    console.log('✅ Response status:', authUsersByIdResponse.status);
    console.log('✅ Response type:', typeof authUsersByIdResponse.data);
    console.log('✅ Is array:', Array.isArray(authUsersByIdResponse.data));
    console.log('✅ Has data property:', !!authUsersByIdResponse.data.data);
    console.log('✅ Authenticated users count (by ID):', authUsersByIdResponse.data.length || authUsersByIdResponse.data.data?.length || 0);

    // Test sellers by role ID
    console.log('\n📋 Testing /api/users?populate=*&filters[role][id][$eq]=4');
    const sellersByIdResponse = await axios.get(`${API_URL}/api/users?populate=*&filters[role][id][$eq]=4`);
    console.log('✅ Response status:', sellersByIdResponse.status);
    console.log('✅ Response type:', typeof sellersByIdResponse.data);
    console.log('✅ Is array:', Array.isArray(sellersByIdResponse.data));
    console.log('✅ Has data property:', !!sellersByIdResponse.data.data);
    console.log('✅ Sellers count (by ID):', sellersByIdResponse.data.length || sellersByIdResponse.data.data?.length || 0);

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('All users:', allUsersResponse.data.length || allUsersResponse.data.data?.length || 0);
    console.log('Authenticated users (by name):', authUsersResponse.data.length || authUsersResponse.data.data?.length || 0);
    console.log('Authenticated users (by ID):', authUsersByIdResponse.data.length || authUsersByIdResponse.data.data?.length || 0);
    console.log('Sellers (by name):', sellersResponse.data.length || sellersResponse.data.data?.length || 0);
    console.log('Sellers (by ID):', sellersByIdResponse.data.length || sellersByIdResponse.data.data?.length || 0);

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('==================');
    
    // Check if response format is consistent
    const allResponses = [
      allUsersResponse.data,
      authUsersResponse.data,
      sellersResponse.data,
      authUsersByIdResponse.data,
      sellersByIdResponse.data
    ];
    
    const hasDataProperty = allResponses.some(r => r.data);
    const isAllArrays = allResponses.every(r => Array.isArray(r));
    
    if (hasDataProperty && !isAllArrays) {
      console.log('⚠️  Mixed response format detected');
      console.log('   - Some responses have .data property, others are direct arrays');
      console.log('   - Frontend should handle both formats');
    } else if (hasDataProperty) {
      console.log('✅ All responses have .data property');
      console.log('   - Frontend should use response.data');
    } else {
      console.log('✅ All responses are direct arrays');
      console.log('   - Frontend should use response directly');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminNotificationUsers(); 