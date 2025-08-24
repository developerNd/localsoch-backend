const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testOrderCouponFields() {
  try {
    console.log('🔍 Testing order coupon fields...\n');

    // Test 1: Check if orders have coupon fields
    console.log('📋 Test 1: Fetching recent orders to check coupon fields...');
    
    const response = await axios.get(`${API_URL}/api/orders`, {
      params: {
        'pagination[pageSize]': 5,
        'sort[0]': 'createdAt:desc'
      }
    });

    if (response.data && response.data.data) {
      console.log(`✅ Found ${response.data.data.length} orders`);
      
      response.data.data.forEach((order, index) => {
        console.log(`\n📦 Order ${index + 1}:`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Total: ${order.totalAmount}`);
        console.log(`   Coupon Code: ${order.couponCode || 'N/A'}`);
        console.log(`   Coupon Discount: ${order.couponDiscount || 'N/A'}`);
        console.log(`   Discount Amount: ${order.discountAmount || 'N/A'}`);
        console.log(`   Subtotal: ${order.subtotal || 'N/A'}`);
        console.log(`   All fields:`, Object.keys(order));
      });
    } else {
      console.log('❌ No orders found or invalid response');
    }

    // Test 2: Check a specific order if we have one with coupon
    console.log('\n📋 Test 2: Looking for orders with coupon data...');
    
    const ordersWithCoupon = response.data.data.filter(order => 
      order.couponCode || order.couponDiscount || order.discountAmount
    );

    if (ordersWithCoupon.length > 0) {
      console.log(`✅ Found ${ordersWithCoupon.length} orders with coupon data`);
      const testOrder = ordersWithCoupon[0];
      console.log('\n🔍 Detailed coupon order data:');
      console.log(JSON.stringify(testOrder, null, 2));
    } else {
      console.log('❌ No orders with coupon data found');
    }

  } catch (error) {
    console.error('❌ Error testing order coupon fields:', error.response?.data || error.message);
  }
}

// Run the test
testOrderCouponFields(); 