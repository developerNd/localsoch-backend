require('dotenv').config();

console.log('🧪 Testing Firebase Configuration...\n');

// Test 1: Check if environment variable exists
console.log('1️⃣ Checking FIREBASE_SERVICE_ACCOUNT environment variable...');
const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountEnv) {
  console.log('   ❌ FIREBASE_SERVICE_ACCOUNT not found in environment');
  process.exit(1);
}

console.log('   ✅ FIREBASE_SERVICE_ACCOUNT found');

// Test 2: Try to parse the JSON
console.log('\n2️⃣ Parsing service account JSON...');
try {
  const serviceAccount = JSON.parse(serviceAccountEnv);
  console.log('   ✅ JSON parsed successfully');
  console.log(`   📋 Project ID: ${serviceAccount.project_id}`);
  console.log(`   📧 Client Email: ${serviceAccount.client_email}`);
  console.log(`   🔑 Private Key ID: ${serviceAccount.private_key_id}`);
  
  // Check required fields
  const requiredFields = ['project_id', 'private_key', 'client_email', 'client_id'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    console.log(`   ❌ Missing required fields: ${missingFields.join(', ')}`);
  } else {
    console.log('   ✅ All required fields present');
  }
  
} catch (error) {
  console.log('   ❌ Failed to parse JSON:', error.message);
  process.exit(1);
}

// Test 3: Test Firebase Admin SDK initialization
console.log('\n3️⃣ Testing Firebase Admin SDK initialization...');
try {
  const admin = require('firebase-admin');
  
  // Clear any existing apps
  if (admin.apps.length > 0) {
    admin.apps.forEach(app => app.delete());
  }
  
  const serviceAccount = JSON.parse(serviceAccountEnv);
  
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  console.log('   ✅ Firebase Admin SDK initialized successfully');
  console.log(`   🔥 Project ID: ${app.options.projectId}`);
  
  // Test messaging
  const messaging = app.messaging();
  console.log('   ✅ Firebase Messaging service available');
  
  app.delete();
  console.log('   ✅ Firebase app cleaned up');
  
} catch (error) {
  console.log('   ❌ Firebase Admin SDK initialization failed:', error.message);
  console.log('   💡 Error details:', error);
  process.exit(1);
}

console.log('\n🎉 Firebase configuration test completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. ✅ Firebase is properly configured');
console.log('2. 🔄 Run database migration (if needed)');
console.log('3. 🚀 Start the Strapi server');
console.log('4. 📱 Test push notifications'); 