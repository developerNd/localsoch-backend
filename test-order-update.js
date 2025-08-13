const fs = require('fs');
const path = require('path');

console.log('🔍 Order Update Test Script');
console.log('==========================');

console.log('\n📋 To test order status update:');
console.log('1. Make sure Strapi is running');
console.log('2. Go to Strapi Admin Dashboard');
console.log('3. Navigate to Content Manager → Orders');
console.log('4. Find order ID: iwgdy10dthl5inxd02ids3e3');

console.log('\n🔧 Step-by-step troubleshooting:');

console.log('\nStep 1: Check the order data');
console.log('- Click on the order to view its details');
console.log('- Check if all required fields are filled:');
console.log('  * orderNumber (should be a unique string)');
console.log('  * totalAmount (should be a number like 100.00)');
console.log('  * customerName (should be a string)');
console.log('  * customerEmail (should be a valid email)');

console.log('\nStep 2: Try updating status');
console.log('- Click "Edit" on the order');
console.log('- In the Status dropdown, select "confirmed"');
console.log('- Click "Save"');

console.log('\nStep 3: If it still fails');
console.log('- Check the browser console for errors');
console.log('- Check the Strapi server console for logs');
console.log('- Try setting status to "pending" first, then "confirmed"');

console.log('\n🎯 Common issues:');
console.log('- totalAmount is null or empty (set it to 0 or a valid number)');
console.log('- customerEmail is invalid (set it to test@example.com)');
console.log('- orderNumber is missing (set it to ORD-123456)');
console.log('- Status value has extra spaces or wrong case');

console.log('\n💡 Quick fix:');
console.log('1. Edit the order');
console.log('2. Set totalAmount to 100.00');
console.log('3. Set customerEmail to test@example.com');
console.log('4. Set customerName to "Test Customer"');
console.log('5. Set orderNumber to "ORD-123456"');
console.log('6. Save the order');
console.log('7. Then try changing status to "confirmed"');

console.log('\n📞 If still not working, please share:');
console.log('- The exact error message from browser console');
console.log('- The current values of all fields in the order');
console.log('- What status value you\'re trying to set'); 