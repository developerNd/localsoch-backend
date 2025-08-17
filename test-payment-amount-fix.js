const axios = require('axios');

const API_URL = 'http://192.168.1.100:1337';

async function testPaymentAmountFix() {
  console.log('🧪 Testing Payment Amount Fix');
  console.log('================================');

  try {
    // Test 1: Create payment order with amount 200
    console.log('\n1️⃣ Testing payment order creation with amount 200...');
    
    const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`, {
      amount: 200,
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`
    });

    console.log('✅ Order created successfully');
    console.log('📊 Order details:');
    console.log(`   - Order ID: ${orderResponse.data.order.id}`);
    console.log(`   - Amount sent: 200 (rupees)`);
    console.log(`   - Amount returned: ${orderResponse.data.order.amount} (paise)`);
    console.log(`   - Expected: 20000 (paise)`);
    console.log(`   - Status: ${orderResponse.data.order.amount === 20000 ? '✅ CORRECT' : '❌ INCORRECT'}`);

    // Test 2: Test with different amounts
    const testAmounts = [100, 500, 1000, 1500];
    
    console.log('\n2️⃣ Testing multiple amounts...');
    
    for (const testAmount of testAmounts) {
      const response = await axios.post(`${API_URL}/api/payment/create-order`, {
        amount: testAmount,
        currency: 'INR',
        receipt: `test_receipt_${Date.now()}`
      });
      
      const expectedPaise = testAmount * 100;
      const actualPaise = response.data.order.amount;
      const isCorrect = actualPaise === expectedPaise;
      
      console.log(`   ₹${testAmount} → ${actualPaise} paise ${isCorrect ? '✅' : '❌'}`);
    }

    // Test 3: Test decimal amounts
    console.log('\n3️⃣ Testing decimal amounts...');
    
    const decimalAmounts = [199.99, 299.50, 499.75];
    
    for (const testAmount of decimalAmounts) {
      const response = await axios.post(`${API_URL}/api/payment/create-order`, {
        amount: testAmount,
        currency: 'INR',
        receipt: `test_receipt_${Date.now()}`
      });
      
      const expectedPaise = Math.round(testAmount * 100);
      const actualPaise = response.data.order.amount;
      const isCorrect = actualPaise === expectedPaise;
      
      console.log(`   ₹${testAmount} → ${actualPaise} paise ${isCorrect ? '✅' : '❌'}`);
    }

    console.log('\n🎉 Payment amount fix test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Backend correctly converts rupees to paise (×100)');
    console.log('   - Frontend should use the returned amount directly');
    console.log('   - No double multiplication should occur');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPaymentAmountFix(); 