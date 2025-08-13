const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');
    
    // Create admin user with minimal parameters
    const adminUser = {
      username: 'admin',
      email: 'admin@cityshopping.com',
      password: 'Admin123!'
    };
    
    const response = await axios.post(`${STRAPI_URL}/api/auth/local/register`, adminUser);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminUser.password);
    console.log('🆔 User ID:', response.data.user.id);
    console.log('🎫 JWT Token:', response.data.jwt);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
      console.log('ℹ️ Admin user already exists. You can use these credentials:');
      console.log('📧 Email: admin@cityshopping.com');
      console.log('🔑 Password: Admin123!');
      
      // Try to login with existing credentials
      try {
        const loginResponse = await axios.post(`${STRAPI_URL}/api/auth/local`, {
          identifier: 'admin@cityshopping.com',
          password: 'Admin123!'
        });
        
        console.log('✅ Login successful with existing admin user');
        console.log('🎫 JWT Token:', loginResponse.data.jwt);
        return loginResponse.data;
      } catch (loginError) {
        console.error('❌ Login failed:', loginError.response?.data || loginError.message);
      }
    }
    
    return null;
  }
}

// Run the script
createAdminUser().then(result => {
  if (result) {
    console.log('🎉 Admin user setup completed!');
    console.log('🔧 Next step: Set up permissions through Strapi admin panel');
    console.log('🌐 Go to: http://localhost:1337/admin');
  } else {
    console.log('💥 Admin user setup failed.');
  }
}); 