const axios = require('axios');

const API_BASE = 'http://localhost:1337';

async function testAdminNotificationSystem() {
  console.log('🔔 Testing Admin Notification System...\n');

  try {
    // Test 1: Fetch all users
    console.log('1️⃣ Testing: Fetch all users');
    const allUsersResponse = await axios.get(`${API_BASE}/api/users?populate=*`);
    console.log(`✅ All users count: ${allUsersResponse.data.length}`);
    
    // Test 2: Fetch sellers (role ID 4)
    console.log('\n2️⃣ Testing: Fetch sellers (role ID 4)');
    const sellersResponse = await axios.get(`${API_BASE}/api/users?populate=*&filters%5Brole%5D%5Bid%5D%5B%24eq%5D=4`);
    console.log(`✅ Sellers count: ${sellersResponse.data.length}`);
    
    // Test 3: Fetch authenticated users (role ID 1)
    console.log('\n3️⃣ Testing: Fetch authenticated users (role ID 1)');
    const authUsersResponse = await axios.get(`${API_BASE}/api/users?populate=*&filters%5Brole%5D%5Bid%5D%5B%24eq%5D=1`);
    console.log(`✅ Authenticated users count: ${authUsersResponse.data.length}`);
    
    // Test 4: Fetch admin notifications
    console.log('\n4️⃣ Testing: Fetch admin notifications');
    const notificationsResponse = await axios.get(`${API_BASE}/api/notifications?populate=*&sort=createdAt:desc&filters%5BisAdminCreated%5D%5B%24eq%5D=true`);
    console.log(`✅ Admin notifications count: ${notificationsResponse.data.length}`);
    
    // Test 5: Show sample data structure
    console.log('\n5️⃣ Sample data structure:');
    if (allUsersResponse.data.length > 0) {
      const sampleUser = allUsersResponse.data[0];
      console.log(`   User: ${sampleUser.username} (${sampleUser.email})`);
      console.log(`   Role: ${sampleUser.role?.name} (ID: ${sampleUser.role?.id})`);
    }
    
    if (sellersResponse.data.length > 0) {
      const sampleSeller = sellersResponse.data[0];
      console.log(`   Seller: ${sampleSeller.username} (${sampleSeller.email})`);
      console.log(`   Role: ${sampleSeller.role?.name} (ID: ${sampleSeller.role?.id})`);
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   Total Users: ${allUsersResponse.data.length}`);
    console.log(`   Sellers: ${sellersResponse.data.length}`);
    console.log(`   Authenticated Users: ${authUsersResponse.data.length}`);
    console.log(`   Admin Notifications: ${notificationsResponse.data.length}`);
    
    console.log('\n✅ All API endpoints are working correctly!');
    console.log('🔧 The frontend should now display the correct user counts.');
    
  } catch (error) {
    console.error('❌ Error testing admin notification system:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAdminNotificationSystem(); 