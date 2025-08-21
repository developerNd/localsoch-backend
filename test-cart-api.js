const axios = require('axios');

const API_URL = 'http://localhost:1337';

// Test cart API endpoints
async function testCartAPI() {
  try {
    console.log('🧪 Testing Cart API...\n');

    // Test 1: Get user cart (requires authentication)
    console.log('1. Testing GET /api/cart/user');
    try {
      const response = await axios.get(`${API_URL}/api/cart/user`);
      console.log('✅ GET /api/cart/user - Success:', response.data);
    } catch (error) {
      console.log('❌ GET /api/cart/user - Error:', error.response?.data || error.message);
    }

    // Test 2: Add item to cart (requires authentication)
    console.log('\n2. Testing POST /api/cart/add');
    try {
      const response = await axios.post(`${API_URL}/api/cart/add`, {
        productId: 1,
        quantity: 2
      });
      console.log('✅ POST /api/cart/add - Success:', response.data);
    } catch (error) {
      console.log('❌ POST /api/cart/add - Error:', error.response?.data || error.message);
    }

    // Test 3: Update cart item (requires authentication)
    console.log('\n3. Testing PUT /api/cart/items/1');
    try {
      const response = await axios.put(`${API_URL}/api/cart/items/1`, {
        quantity: 3
      });
      console.log('✅ PUT /api/cart/items/1 - Success:', response.data);
    } catch (error) {
      console.log('❌ PUT /api/cart/items/1 - Error:', error.response?.data || error.message);
    }

    // Test 4: Remove cart item (requires authentication)
    console.log('\n4. Testing DELETE /api/cart/items/1');
    try {
      const response = await axios.delete(`${API_URL}/api/cart/items/1`);
      console.log('✅ DELETE /api/cart/items/1 - Success:', response.data);
    } catch (error) {
      console.log('❌ DELETE /api/cart/items/1 - Error:', error.response?.data || error.message);
    }

    // Test 5: Clear cart (requires authentication)
    console.log('\n5. Testing DELETE /api/cart/clear');
    try {
      const response = await axios.delete(`${API_URL}/api/cart/clear`);
      console.log('✅ DELETE /api/cart/clear - Success:', response.data);
    } catch (error) {
      console.log('❌ DELETE /api/cart/clear - Error:', error.response?.data || error.message);
    }

    // Test 6: Default cart routes
    console.log('\n6. Testing default cart routes');
    try {
      const response = await axios.get(`${API_URL}/api/carts`);
      console.log('✅ GET /api/carts - Success:', response.data);
    } catch (error) {
      console.log('❌ GET /api/carts - Error:', error.response?.data || error.message);
    }

    console.log('\n🎉 Cart API testing completed!');
    console.log('\n📝 Note: Most endpoints require authentication. The errors above are expected if not authenticated.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCartAPI(); 