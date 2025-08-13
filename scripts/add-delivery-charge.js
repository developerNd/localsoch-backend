// Script to add delivery charge to existing orders
// Run this script after updating the schema

console.log('🔄 To add delivery charge to existing orders, please follow these steps:');
console.log('');
console.log('1. First, restart your Strapi server to apply the schema changes');
console.log('2. Then run this SQL query in your database:');
console.log('');
console.log('UPDATE orders SET delivery_charge = 50 WHERE delivery_charge IS NULL;');
console.log('');
console.log('3. Or manually update each order through the Strapi admin panel');
console.log('');
console.log('✅ This will ensure all existing orders have the delivery charge field set to ₹50');
console.log('');
console.log('📝 For new orders, the delivery charge will be automatically added during order creation.'); 