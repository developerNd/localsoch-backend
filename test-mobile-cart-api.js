const axios = require('axios');

const API_URL = 'http://localhost:1337';

// Test mobile app cart API endpoints
async function testMobileCartAPI() {
  try {
    console.log('🧪 Testing Mobile App Cart API...\n');

    // Test 1: Get cart (mobile app endpoint)
    console.log('1. Testing GET /api/cart?populate=*');
    try {
      const response = await axios.get(`${API_URL}/api/cart?populate=*`);
      console.log('✅ GET /api/cart - Success:', response.data);
    } catch (error) {
      console.log('❌ GET /api/cart - Error:', error.response?.data || error.message);
    }

    // Test 2: Add item to cart (mobile app format)
    console.log('\n2. Testing POST /api/cart (mobile app format)');
    try {
      const cartItem = {
        data: {
          productId: 1,
          productName: "Test Product",
          price: 100.00,
          image: "test-image.jpg",
          quantity: 2,
          size: "M",
          vendorId: 1,
          vendorName: "Test Vendor",
          vendorCity: "Test City",
          vendorState: "Test State",
          vendorPincode: "123456",
          stock: 10,
          categoryName: "Test Category"
        }
      };
      
      const response = await axios.post(`${API_URL}/api/cart`, cartItem);
      console.log('✅ POST /api/cart - Success:', response.data);
    } catch (error) {
      console.log('❌ POST /api/cart - Error:', error.response?.data || error.message);
    }

    // Test 3: Update cart item (mobile app format)
    console.log('\n3. Testing PUT /api/cart/1 (mobile app format)');
    try {
      const updateData = {
        data: {
          quantity: 3
        }
      };
      
      const response = await axios.put(`${API_URL}/api/cart/1`, updateData);
      console.log('✅ PUT /api/cart/1 - Success:', response.data);
    } catch (error) {
      console.log('❌ PUT /api/cart/1 - Error:', error.response?.data || error.message);
    }

    // Test 4: Remove cart item
    console.log('\n4. Testing DELETE /api/cart/1');
    try {
      const response = await axios.delete(`${API_URL}/api/cart/1`);
      console.log('✅ DELETE /api/cart/1 - Success:', response.data);
    } catch (error) {
      console.log('❌ DELETE /api/cart/1 - Error:', error.response?.data || error.message);
    }

    // Test 5: Clear cart
    console.log('\n5. Testing DELETE /api/cart/clear');
    try {
      const response = await axios.delete(`${API_URL}/api/cart/clear`);
      console.log('✅ DELETE /api/cart/clear - Success:', response.data);
    } catch (error) {
      console.log('❌ DELETE /api/cart/clear - Error:', error.response?.data || error.message);
    }

    // Test 6: Test with authentication
    console.log('\n6. Testing with authentication...');
    try {
      // Try to login (replace with actual test user credentials)
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'test@example.com',
        password: 'password123'
      });
      
      const token = loginResponse.data.jwt;
      const headers = { Authorization: `Bearer ${token}` };

      // Test authenticated cart access
      const cartResponse = await axios.get(`${API_URL}/api/cart?populate=*`, { headers });
      console.log('✅ Authenticated GET /api/cart - Success:', cartResponse.data);
      
    } catch (error) {
      console.log('❌ Authentication test failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Mobile Cart API testing completed!');
    console.log('\n📝 Note: Some endpoints require authentication. Errors are expected if not authenticated.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test server status
async function testServerStatus() {
  try {
    console.log('🔍 Testing server status...');
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Server is running:', response.data);
  } catch (error) {
    console.log('❌ Server not responding:', error.message);
  }
}

// Run tests
async function runTests() {
  await testServerStatus();
  console.log('\n' + '='.repeat(50) + '\n');
  await testMobileCartAPI();
}

runTests(); 