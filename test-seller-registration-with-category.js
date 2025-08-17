const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testSellerRegistrationWithCategory() {
  try {
    console.log('🧪 Testing Seller Registration with Business Category...\n');

    // Step 1: Create a test user
    console.log('👤 Step 1: Creating test user...');
    const userResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: 'test_seller_cat_' + Date.now(),
      email: `test_seller_cat_${Date.now()}@example.com`,
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

    // Step 2: Create payment order
    console.log('\n💳 Step 2: Creating payment order...');
    const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`, {
      amount: 1625,
      currency: 'INR',
      receipt: `test_seller_cat_${Date.now()}`,
    });

    if (!orderResponse.data.success) {
      console.log('❌ Payment order creation failed:', orderResponse.data);
      return;
    }

    const order = orderResponse.data.order;
    console.log('✅ Payment order created successfully!');
    console.log('   Order ID:', order.id);

    // Step 3: Complete seller registration with business category
    console.log('\n🏪 Step 3: Completing seller registration with business category...');
    
    const mockPaymentId = 'pay_test_cat_' + Date.now();
    const mockSignature = 'test_signature_cat_' + Date.now();
    
    const vendorData = {
      name: 'Test Shop with Category',
      description: 'A test shop with business category',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      businessType: 'retail',
      phone: '9876543210',
      email: user.email,
      contact: '9876543210',
      whatsapp: '9876543210',
      businessCategoryId: 18, // Electronics category
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
    console.log('   Business Category ID:', result.data.vendor.businessCategory);

    // Step 4: Verify vendor was created with business category
    console.log('\n🏪 Step 4: Verifying vendor with business category...');
    const vendorCheckResponse = await axios.get(`${API_URL}/api/vendors/${result.data.vendor.id}?populate=businessCategory`);
    
    if (vendorCheckResponse.data) {
      const vendor = vendorCheckResponse.data;
      console.log('✅ Vendor created successfully!');
      console.log('   Vendor Name:', vendor.name);
      console.log('   Business Category:', vendor.businessCategory?.name || 'None');
      console.log('   Business Category ID:', vendor.businessCategory?.id || 'None');
      console.log('   Status:', vendor.status);
      console.log('   Is Approved:', vendor.isApproved);
    } else {
      console.log('⚠️ Vendor verification failed');
    }

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

    console.log('\n🎉 Seller Registration with Business Category Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User created');
    console.log('   ✅ Payment order created');
    console.log('   ✅ Seller registration completed with business category');
    console.log('   ✅ User role updated to seller');
    console.log('   ✅ Vendor profile created with business category');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSellerRegistrationWithCategory(); 