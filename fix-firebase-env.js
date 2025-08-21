const fs = require('fs');

console.log('🔧 Fixing Firebase Environment Variable...\n');

// Read the current .env file
const envPath = '.env';
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract the Firebase service account JSON
const firebaseMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT=\{([\s\S]*?)\}/);

if (!firebaseMatch) {
  console.log('❌ FIREBASE_SERVICE_ACCOUNT not found in .env file');
  process.exit(1);
}

// Parse the JSON content
const jsonContent = firebaseMatch[1];
console.log('📋 Extracted JSON content length:', jsonContent.length);

try {
  // Parse the JSON to validate it
  const serviceAccount = JSON.parse(jsonContent);
  console.log('✅ JSON is valid');
  console.log(`📋 Project ID: ${serviceAccount.project_id}`);
  
  // Create a properly formatted single-line JSON
  const formattedJson = JSON.stringify(serviceAccount);
  
  // Replace the multi-line JSON with single-line
  const newEnvContent = envContent.replace(
    /FIREBASE_SERVICE_ACCOUNT=\{[\s\S]*?\}/,
    `FIREBASE_SERVICE_ACCOUNT=${formattedJson}`
  );
  
  // Write back to .env file
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log('✅ Firebase environment variable fixed!');
  console.log('📝 Updated .env file with properly formatted JSON');
  
  // Test the new format
  console.log('\n🧪 Testing the fixed configuration...');
  require('dotenv').config();
  const testJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log('✅ New format works correctly!');
  
} catch (error) {
  console.log('❌ Error fixing Firebase environment variable:', error.message);
  process.exit(1);
} 