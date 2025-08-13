const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function checkPermissionsStatus() {
  try {
    console.log('🔍 Checking current permission status...');
    
    // Login to get JWT token
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com',
      password: 'Admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Login successful');
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Test public access (without authentication)
    console.log('\n🌐 Testing public access (no authentication)...');
    const publicEndpoints = [
      '/api/categories',
      '/api/products',
      '/api/vendors',
      '/api/banners',
      '/api/featured-products',
      '/api/orders'
    ];
    
    for (const endpoint of publicEndpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`);
        console.log(`✅ ${endpoint}: ${response.data.data?.length || 0} items (PUBLIC ACCESS)`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message} (PUBLIC ACCESS)`);
      }
    }
    
    // Test authenticated access
    console.log('\n🔐 Testing authenticated access...');
    for (const endpoint of publicEndpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, { headers });
        console.log(`✅ ${endpoint}: ${response.data.data?.length || 0} items (AUTHENTICATED)`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message} (AUTHENTICATED)`);
      }
    }
    
    // Test user info
    console.log('\n👤 Testing user info access...');
    try {
      const userResponse = await axios.get(`${API_URL}/api/users/me`, { headers });
      console.log('✅ User info accessible');
      console.log('   - ID:', userResponse.data.id);
      console.log('   - Username:', userResponse.data.username);
      console.log('   - Email:', userResponse.data.email);
      console.log('   - Role:', userResponse.data.role?.name || 'No role assigned');
    } catch (error) {
      console.log('❌ User info not accessible:', error.response?.status);
    }
    
    // Test auth endpoints
    console.log('\n🔑 Testing auth endpoints...');
    const authEndpoints = [
      '/api/auth/local',
      '/api/auth/local/register'
    ];
    
    for (const endpoint of authEndpoints) {
      try {
        const response = await axios.post(`${API_URL}${endpoint}`, {
          identifier: 'test@test.com',
          password: 'test123'
        });
        console.log(`✅ ${endpoint}: Working`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('Invalid identifier')) {
          console.log(`✅ ${endpoint}: Working (expected validation error)`);
        } else {
          console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
        }
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('🔧 The issue is that PUBLIC permissions are not set up correctly.');
    console.log('🔧 You need to enable PUBLIC access to these endpoints:');
    console.log('   - api::category.category → find');
    console.log('   - api::product.product → find');
    console.log('   - api::vendor.vendor → find');
    console.log('   - api::banner.banner → find');
    console.log('   - api::featured-product.featured-product → find');
    console.log('   - api::order.order → find, create, update');
    console.log('   - plugin::users-permissions.auth → register, callback');
    
  } catch (error) {
    console.error('❌ Error checking permissions:', error.response?.data || error.message);
  }
}

checkPermissionsStatus(); 