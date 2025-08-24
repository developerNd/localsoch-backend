const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function checkOrderPermissions() {
  try {
    console.log('🔍 Checking order permissions...\n');

    // Test 1: Check if we can access orders at all
    console.log('📋 Test 1: Checking basic order access...');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders`);
      console.log('✅ Orders endpoint accessible');
    } catch (error) {
      console.log('❌ Orders endpoint not accessible:', error.response?.status, error.response?.data);
    }

    // Test 2: Check if we can update orders
    console.log('\n📋 Test 2: Checking order update permission...');
    
    try {
      const response = await axios.put(`${API_URL}/api/orders/1`, {
        data: { status: 'test' }
      });
      console.log('✅ Order update accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Order update requires auth (401)');
      } else if (error.response?.status === 403) {
        console.log('❌ Order update forbidden (403) - permission issue');
      } else {
        console.log('⚠️ Order update response:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Check if we can access a specific order
    console.log('\n📋 Test 3: Checking specific order access...');
    
    try {
      const response = await axios.get(`${API_URL}/api/orders/1`);
      console.log('✅ Specific order accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Specific order requires auth (401)');
      } else if (error.response?.status === 403) {
        console.log('❌ Specific order forbidden (403) - permission issue');
      } else {
        console.log('⚠️ Specific order response:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n📋 Test 4: Checking available routes...');
    
    try {
      const response = await axios.get(`${API_URL}/_health`);
      console.log('✅ Health endpoint accessible');
    } catch (error) {
      console.log('❌ Health endpoint not accessible:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Error checking permissions:', error.response?.data || error.message);
  }
}

// Run the test
checkOrderPermissions(); 