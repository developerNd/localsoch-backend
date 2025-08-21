const pushNotificationService = require('./src/services/pushNotificationService');

async function testPushService() {
  console.log('🧪 Testing Push Notification Service...\n');

  try {
    // Test updating user token
    console.log('1️⃣ Testing updateUserToken...');
    await pushNotificationService.updateUserToken(1, 'test_token_from_service');
    console.log('✅ updateUserToken completed');

    // Test updating vendor token
    console.log('\n2️⃣ Testing updateVendorToken...');
    await pushNotificationService.updateVendorToken(1, 'test_vendor_token_from_service');
    console.log('✅ updateVendorToken completed');

    // Test getting user token
    console.log('\n3️⃣ Testing getUserToken...');
    const userToken = await pushNotificationService.getUserToken(1);
    console.log('✅ getUserToken result:', userToken);

    // Test getting vendor token
    console.log('\n4️⃣ Testing getVendorToken...');
    const vendorToken = await pushNotificationService.getVendorToken(1);
    console.log('✅ getVendorToken result:', vendorToken);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPushService().catch(console.error); 