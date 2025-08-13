const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testProductCreation() {
  try {
    console.log('🧪 Testing product creation after route fixes...');
    
    // Step 1: Login with super admin
    console.log('\n🔐 Step 1: Logging in with super admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });
    
    const jwt = loginResponse.data.jwt;
    console.log('✅ Super admin login successful!');
    
    const headers = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Test product creation
    console.log('\n📦 Step 2: Testing product creation...');
    
    const testProduct = {
      data: {
        name: 'Test Product After Fix',
        description: 'This is a test product created after fixing the routes',
        price: 150.00,
        stock: 25
      }
    };
    
    try {
      const response = await axios.post(`${API_URL}/api/products`, testProduct, { headers });
      console.log('✅ Product creation successful!');
      console.log('   Product ID:', response.data.data.id);
      console.log('   Product Name:', response.data.data.name);
      console.log('   Product Price:', response.data.data.price);
    } catch (error) {
      console.log('❌ Product creation failed:', error.response?.status, error.response?.data);
    }
    
    // Step 3: Test getting products
    console.log('\n📋 Step 3: Testing product retrieval...');
    try {
      const productsResponse = await axios.get(`${API_URL}/api/products`);
      console.log('✅ Products retrieval successful!');
      console.log('   Total products:', productsResponse.data.data?.length || 0);
      
      if (productsResponse.data.data && productsResponse.data.data.length > 0) {
        console.log('   Sample product:', productsResponse.data.data[0].name);
      }
    } catch (error) {
      console.log('❌ Products retrieval failed:', error.response?.status);
    }
    
    // Step 4: Test public access
    console.log('\n🌐 Step 4: Testing public access...');
    try {
      const publicResponse = await axios.get(`${API_URL}/api/products`);
      console.log('✅ Public access to products successful!');
      console.log('   Products available publicly:', publicResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Public access failed:', error.response?.status);
    }
    
    console.log('\n🎉 Product creation test completed!');
    
  } catch (error) {
    console.error('❌ Error testing product creation:', error.response?.data || error.message);
  }
}

testProductCreation(); 