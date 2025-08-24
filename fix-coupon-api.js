const fs = require('fs');
const path = require('path');

console.log('🔧 Checking Coupon API Configuration');
console.log('====================================');

// Check if coupon API files exist
const couponDir = path.join(__dirname, 'src/api/coupon');
const requiredFiles = [
  'content-types/coupon/schema.json',
  'controllers/coupon.js',
  'routes/coupon.js'
];

console.log('\n1️⃣ Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(couponDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the coupon API setup.');
  process.exit(1);
}

// Check schema content
console.log('\n2️⃣ Checking schema configuration...');
const schemaPath = path.join(couponDir, 'content-types/coupon/schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

if (schema.kind === 'collectionType' && schema.collectionName === 'coupons') {
  console.log('✅ Schema configuration is correct');
} else {
  console.log('❌ Schema configuration is incorrect');
}

// Check routes configuration
console.log('\n3️⃣ Checking routes configuration...');
const routesPath = path.join(couponDir, 'routes/coupon.js');
const routesContent = fs.readFileSync(routesPath, 'utf8');

if (routesContent.includes('/coupons/validate')) {
  console.log('✅ Coupon validation route is configured');
} else {
  console.log('❌ Coupon validation route is missing');
}

console.log('\n🎯 Next Steps:');
console.log('1. Make sure the backend server is running');
console.log('2. Restart the backend server to register the new API');
console.log('3. Run: npm run develop');
console.log('4. Check if the coupon API appears in Strapi admin panel');

console.log('\n🔍 To test the API manually:');
console.log('curl -X POST http://localhost:1337/api/coupons/validate \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"couponCode":"TEST123","orderAmount":100,"userId":1}\''); 