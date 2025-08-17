const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function testVendorCreation() {
  try {
    console.log('🧪 Testing Vendor Creation...');
    
    // Step 1: Login as a test user (or create one)
    console.log('\n👤 Step 1: Testing user login...');
    
    // Create a test user first
    console.log('📝 Creating test user...');
    const registerResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@example.com`,
      password: 'testpass123'
    });
    
    if (!registerResponse.data.jwt) {
      throw new Error('Failed to create test user');
    }
    
    console.log('✅ Test user created successfully');
    const jwt = registerResponse.data.jwt;
    const userId = registerResponse.data.user.id;

    // Step 2: Test vendor creation
    console.log('\n🏪 Step 2: Testing vendor creation...');
    
    const vendorData = {
      name: 'Test Shop',
      description: 'A test shop for testing vendor creation',
      address: '123 Test Street, Test Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      businessType: 'retail',
      contact: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'testshop@example.com',
      isActive: true,
      isApproved: false,
      status: 'pending'
    };

    console.log('📝 Creating vendor with data:', vendorData);

    const vendorResponse = await axios.post(`${API_URL}/api/vendors`, {
      data: vendorData
    }, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });

    if (vendorResponse.data.data) {
      console.log('✅ Vendor creation successful!');
      console.log('   Vendor ID:', vendorResponse.data.data.id);
      console.log('   Vendor Name:', vendorResponse.data.data.name);
      console.log('   User ID:', vendorResponse.data.data.user);
      console.log('   Status:', vendorResponse.data.data.status);
      console.log('   Is Approved:', vendorResponse.data.data.isApproved);
    } else {
      console.log('❌ Vendor creation failed:', vendorResponse.data);
    }

  } catch (error) {
    console.error('❌ Error testing vendor creation:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testVendorCreation(); 