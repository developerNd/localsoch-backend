// Test script for product status change notifications
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testProductStatusNotification() {
  try {
    console.log('🧪 Testing Product Status Change Notifications...\n');

    // Test 1: Get products with vendors
    console.log('1️⃣ Getting Products with Vendors...');
    try {
      const productsResponse = await axios.get(`${API_URL}/api/products?populate=vendor,vendor.user`);
      console.log('✅ Products endpoint working');
      console.log('📊 Total products:', productsResponse.data.data?.length || 0);
      
      if (productsResponse.data.data && productsResponse.data.data.length > 0) {
        console.log('📦 Products with vendors:');
        productsResponse.data.data.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.attributes.name} (ID: ${product.id})`);
          console.log(`     Vendor: ${product.attributes.vendor?.data?.attributes?.name || 'No vendor'} (ID: ${product.attributes.vendor?.data?.id || 'N/A'})`);
        });
      }
    } catch (error) {
      console.log('❌ Products endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 2: Get vendors
    console.log('\n2️⃣ Getting Vendors...');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=user`);
      console.log('✅ Vendors endpoint working');
      console.log('📊 Total vendors:', vendorsResponse.data.data?.length || 0);
      
      if (vendorsResponse.data.data && vendorsResponse.data.data.length > 0) {
        console.log('🏪 Vendors:');
        vendorsResponse.data.data.forEach((vendor, index) => {
          console.log(`  ${index + 1}. ${vendor.attributes.name || vendor.attributes.shopName} (ID: ${vendor.id})`);
          console.log(`     User: ${vendor.attributes.user?.data?.attributes?.username || 'No user'} (ID: ${vendor.attributes.user?.data?.id || 'N/A'})`);
        });
      }
    } catch (error) {
      console.log('❌ Vendors endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    // Test 3: Check notifications
    console.log('\n3️⃣ Checking Current Notifications...');
    try {
      const notificationsResponse = await axios.get(`${API_URL}/api/notifications?populate=*&sort=createdAt:desc&pagination[limit]=5`);
      console.log('✅ Notifications endpoint working');
      console.log('📊 Recent notifications:', notificationsResponse.data.data?.length || 0);
      
      if (notificationsResponse.data.data && notificationsResponse.data.data.length > 0) {
        console.log('🔔 Recent notifications:');
        notificationsResponse.data.data.forEach((notification, index) => {
          console.log(`  ${index + 1}. ${notification.attributes.title}`);
          console.log(`     Type: ${notification.attributes.type}`);
          console.log(`     Vendor: ${notification.attributes.vendor?.data?.id || 'N/A'}`);
          console.log(`     User: ${notification.attributes.user?.data?.id || 'N/A'}`);
        });
      }
    } catch (error) {
      console.log('❌ Notifications endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Product Status Notification Test Complete!');
    console.log('\n📋 To test product status change notifications:');
    console.log('1. Find a product with a vendor (from step 1)');
    console.log('2. Use admin panel to approve/reject that product');
    console.log('3. Check the Strapi logs for notification messages');
    console.log('4. Check seller dashboard for the notification');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductStatusNotification(); 