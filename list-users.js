const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function listUsers() {
  try {
    console.log('👥 Listing existing users...');
    
    // Try to login with the original credentials first
    let jwt = null;
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'admin@cityshopping.com',
        password: 'Admin123!'
      });
      jwt = loginResponse.data.jwt;
      console.log('✅ Login successful with original credentials');
    } catch (error) {
      console.log('❌ Original credentials failed');
    }
    
    if (!jwt) {
      // Try to login with new credentials
      try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
          identifier: 'admin@gmail.com',
          password: 'Admin@123'
        });
        jwt = loginResponse.data.jwt;
        console.log('✅ Login successful with new credentials');
      } catch (error) {
        console.log('❌ New credentials failed');
        console.log('🔧 No valid credentials found. Please check your admin credentials.');
        return;
      }
    }
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Try to get users list
    try {
      const usersResponse = await axios.get(`${API_URL}/api/users`, { headers });
      console.log('\n📋 Existing users:');
      usersResponse.data.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
      });
    } catch (error) {
      console.log('❌ Cannot access users list:', error.response?.status);
      console.log('🔧 This might be due to permission restrictions.');
    }
    
    // Try to get current user info
    try {
      const meResponse = await axios.get(`${API_URL}/api/users/me`, { headers });
      console.log('\n👤 Current user info:');
      console.log('ID:', meResponse.data.id);
      console.log('Username:', meResponse.data.username);
      console.log('Email:', meResponse.data.email);
      console.log('Role:', meResponse.data.role?.name || 'No role assigned');
    } catch (error) {
      console.log('❌ Cannot access current user info:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Error listing users:', error.response?.data || error.message);
  }
}

listUsers(); 