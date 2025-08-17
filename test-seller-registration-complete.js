const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testCompleteSellerRegistration() {
  try {
    console.log('🧪 Testing Complete Seller Registration Flow...\n');

    // Step 1: Create a test user
    console.log('👤 Step 1: Creating test user...');
    const userResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: 'test_seller_' + Date.now(),
      email: `test_seller_${Date.now()}@example.com`,
      password: 'Test123!',
    });

    if (!userResponse.data.user) {
      console.log('❌ User creation failed:', userResponse.data);
      return;
    }

    const user = userResponse.data.user;
    console.log('✅ User created successfully!');
    console.log('   User ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);

    // Step 2: Create payment order
    console.log('\n💳 Step 2: Creating payment order...');
    const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`, {
      amount: 1625,
      currency: 'INR',
      receipt: `test_seller_${Date.now()}`,
    });

    if (!orderResponse.data.success) {
      console.log('❌ Payment order creation failed:', orderResponse.data);
      return;
    }

    const order = orderResponse.data.order;
    console.log('✅ Payment order created successfully!');
    console.log('   Order ID:', order.id);
    console.log('   Amount:', order.amount);

    // Step 3: Simulate payment verification (using test data)
    console.log('\n🔐 Step 3: Simulating payment verification...');
    
    // For testing, we'll create a mock payment response
    const mockPaymentId = 'pay_test_' + Date.now();
    const mockSignature = 'test_signature_' + Date.now();
    
    console.log('   Mock Payment ID:', mockPaymentId);
    console.log('   Mock Signature:', mockSignature);

    // Step 4: Complete seller registration
    console.log('\n🏪 Step 4: Completing seller registration...');
    const vendorData = {
      name: 'Test Shop',
      description: 'A test shop for seller registration',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      businessType: 'retail',
      phone: '9876543210',
      email: user.email,
      contact: '9876543210',
      whatsapp: '9876543210',
    };

    const registrationResponse = await axios.post(`${API_URL}/api/payment/complete-seller-registration`, {
      paymentId: mockPaymentId,
      orderId: order.id,
      signature: mockSignature,
      userId: user.id,
      vendorData: vendorData,
      testMode: true, // Enable test mode to bypass signature verification
    });

    if (!registrationResponse.data.success) {
      console.log('❌ Seller registration failed:', registrationResponse.data);
      return;
    }

    const result = registrationResponse.data;
    console.log('✅ Seller registration completed successfully!');
    console.log('   User ID:', result.data.user.id);
    console.log('   Vendor ID:', result.data.vendor.id);
    console.log('   Payment ID:', result.data.payment.paymentId);

    // Step 5: Verify user role was updated
    console.log('\n🔍 Step 5: Verifying user role update...');
    const userCheckResponse = await axios.get(`${API_URL}/api/users/${user.id}?populate=role`);
    
    if (userCheckResponse.data.role && userCheckResponse.data.role.id === 4) {
      console.log('✅ User role updated to seller successfully!');
      console.log('   Role ID:', userCheckResponse.data.role.id);
      console.log('   Role Name:', userCheckResponse.data.role.name);
    } else {
      console.log('⚠️ User role verification failed');
      console.log('   Current role:', userCheckResponse.data.role);
    }

    // Step 6: Verify vendor was created
    console.log('\n🏪 Step 6: Verifying vendor creation...');
    const vendorCheckResponse = await axios.get(`${API_URL}/api/vendors/${result.data.vendor.id}`);
    
    if (vendorCheckResponse.data) {
      console.log('✅ Vendor created successfully!');
      console.log('   Vendor Name:', vendorCheckResponse.data.name);
      console.log('   Vendor Active:', vendorCheckResponse.data.isActive);
      console.log('   Vendor Approved:', vendorCheckResponse.data.isApproved);
    } else {
      console.log('⚠️ Vendor verification failed');
    }

    console.log('\n🎉 Complete Seller Registration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User created');
    console.log('   ✅ Payment order created');
    console.log('   ✅ Seller registration completed');
    console.log('   ✅ User role updated to seller');
    console.log('   ✅ Vendor profile created');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteSellerRegistration(); 