const axios = require('axios');

const API_URL = 'http://localhost:1337';

// Test cart API endpoints with authentication
async function testCartAPI() {
  try {
    console.log('🧪 Testing Cart API with Authentication...\n');

    // First, let's get a user token (you'll need to replace with actual credentials)
    console.log('1. Testing Authentication...');
    let authToken = null;
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'test@example.com', // Replace with actual test user
        password: 'password123'
      });
      authToken = loginResponse.data.jwt;
      console.log('✅ Authentication successful');
    } catch (error) {
      console.log('⚠️  Authentication failed, testing without auth:', error.response?.data || error.message);
    }

    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    // Test 1: Get user cart
    console.log('\n2. Testing GET /api/cart/user');
    try {
      const response = await axios.get(`${API_URL}/api/cart/user`, { headers });
      console.log('✅ GET /api/cart/user - Success:', response.data);
    } catch (error) {
      console.log('❌ GET /api/cart/user - Error:', error.response?.data || error.message);
    }

    // Test 2: Add item to cart
    console.log('\n3. Testing POST /api/cart/add');
    try {
      const response = await axios.post(`${API_URL}/api/cart/add`, {
        productId: 1,
        quantity: 2
      }, { headers });
      console.log('✅ POST /api/cart/add - Success:', response.data);
    } catch (error) {
      console.log('❌ POST /api/cart/add - Error:', error.response?.data || error.message);
    }

    // Test 3: Update cart item
    console.log('\n4. Testing PUT /api/cart/items/1');
    try {
      const response = await axios.put(`${API_URL}/api/cart/items/1`, {
        quantity: 3
      }, { headers });
      console.log('✅ PUT /api/cart/items/1 - Success:', response.data);
    } catch (error) {
      console.log('❌ PUT /api/cart/items/1 - Error:', error.response?.data || error.message);
    }

    // Test 4: Remove cart item
    console.log('\n5. Testing DELETE /api/cart/items/1');
    try {
      const response = await axios.delete(`${API_URL}/api/cart/items/1`, { headers });
      console.log('✅ DELETE /api/cart/items/1 - Success:', response.data);
    } catch (error) {
      console.log('❌ DELETE /api/cart/items/1 - Error:', error.response?.data || error.message);
    }

    // Test 5: Clear cart
    console.log('\n6. Testing DELETE /api/cart/clear');
    try {
      const response = await axios.delete(`${API_URL}/api/cart/clear`, { headers });
      console.log('✅ DELETE /api/cart/clear - Success:', response.data);
    } catch (error) {
      console.log('❌ DELETE /api/cart/clear - Error:', error.response?.data || error.message);
    }

    // Test 6: Default cart routes
    console.log('\n7. Testing default cart routes');
    try {
      const response = await axios.get(`${API_URL}/api/carts`, { headers });
      console.log('✅ GET /api/carts - Success:', response.data);
    } catch (error) {
      console.log('❌ GET /api/carts - Error:', error.response?.data || error.message);
    }

    // Test 7: Create cart item directly
    console.log('\n8. Testing POST /api/carts (direct creation)');
    try {
      const response = await axios.post(`${API_URL}/api/carts`, {
        data: {
          user: 1, // Replace with actual user ID
          product: 1,
          quantity: 1,
          price: 100.00,
          totalPrice: 100.00,
          isActive: true
        }
      }, { headers });
      console.log('✅ POST /api/carts - Success:', response.data);
    } catch (error) {
      console.log('❌ POST /api/carts - Error:', error.response?.data || error.message);
    }

    console.log('\n🎉 Cart API testing completed!');
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
  await testCartAPI();
}

runTests(); 