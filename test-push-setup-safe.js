const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

async function testPushNotificationSetup() {
  console.log('🧪 Testing Push Notification Setup...\n');
  
  try {
    // Test 1: Check if notification routes are accessible
    console.log('1️⃣ Testing notification routes...');
    
    const routes = [
      '/notifications',
      '/notifications/push/stats',
    ];
    
    for (const route of routes) {
      try {
        const response = await axios.get(`${BASE_URL}${route}`);
        console.log(`   ✅ ${route} - Status: ${response.status}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`   ⚠️  ${route} - Requires authentication (expected)`);
        } else {
          console.log(`   ❌ ${route} - Error: ${error.message}`);
        }
      }
    }
    
    // Test 2: Check Firebase configuration
    console.log('\n2️⃣ Testing Firebase configuration...');
    
    const firebaseConfig = require('./src/config/firebase');
    if (firebaseConfig.firebaseApp) {
      console.log('   ✅ Firebase Admin SDK is initialized');
    } else {
      console.log('   ❌ Firebase Admin SDK not initialized');
      console.log('   💡 Check your FIREBASE_* environment variables');
    }
    
    // Test 3: Check notification service
    console.log('\n3️⃣ Testing notification service...');
    
    const pushService = require('./src/services/pushNotificationService');
    console.log('   ✅ Push notification service loaded');
    
    // Test 4: Check database schema (safe read-only)
    console.log('\n4️⃣ Testing database schema...');
    
    const { createCoreService } = require('@strapi/strapi').factories;
    const notificationService = createCoreService('api::notification.notification');
    
    try {
      const count = await notificationService.count();
      console.log(`   ✅ Notification table accessible - ${count} records`);
    } catch (error) {
      console.log(`   ❌ Notification table error: ${error.message}`);
    }
    
    console.log('\n🎉 Push notification setup test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Set up Firebase environment variables');
    console.log('2. Run database migration if needed');
    console.log('3. Test with actual push notifications');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPushNotificationSetup(); 