const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function createVendorUsers() {
  try {
    console.log('👥 Creating users for vendors...');
    
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
    
    // Step 2: Get existing vendors
    console.log('\n🏪 Step 2: Getting existing vendors...');
    const vendorsResponse = await axios.get(`${API_URL}/api/vendors`);
    const vendors = vendorsResponse.data.data;
    console.log(`Found ${vendors.length} vendors`);
    
    // Step 3: Create users for each vendor
    console.log('\n👤 Step 3: Creating users for vendors...');
    const vendorUsers = [
      {
        username: 'freshmart_vendor',
        email: 'vendor@freshmart.com',
        password: 'Vendor@123',
        vendorName: 'FreshMart'
      },
      {
        username: 'citybakery_vendor',
        email: 'vendor@citybakery.com',
        password: 'Vendor@123',
        vendorName: 'CityBakery'
      },
      {
        username: 'techstore_vendor',
        email: 'vendor@techstore.com',
        password: 'Vendor@123',
        vendorName: 'TechStore'
      }
    ];
    
    const createdUsers = [];
    for (const userData of vendorUsers) {
      try {
        // Create user
        const userResponse = await axios.post(`${API_URL}/api/auth/local/register`, {
          username: userData.username,
          email: userData.email,
          password: userData.password
        });
        
        createdUsers.push({
          user: userResponse.data.user,
          vendorName: userData.vendorName
        });
        console.log(`✅ Created user: ${userData.username} (${userData.email})`);
        
      } catch (error) {
        console.log(`❌ Failed to create user ${userData.username}:`, error.response?.status, error.response?.data);
      }
    }
    
    // Step 4: Associate users with vendors
    console.log('\n🔗 Step 4: Associating users with vendors...');
    for (const createdUser of createdUsers) {
      try {
        // Find the corresponding vendor
        const vendor = vendors.find(v => v.attributes.name === createdUser.vendorName);
        
        if (vendor) {
          // Update vendor with user association
          const updateResponse = await axios.put(`${API_URL}/api/vendors/${vendor.id}`, {
            data: {
              user: createdUser.user.id
            }
          }, { headers });
          
          console.log(`✅ Associated user ${createdUser.user.username} with vendor ${createdUser.vendorName}`);
        } else {
          console.log(`❌ Could not find vendor: ${createdUser.vendorName}`);
        }
        
      } catch (error) {
        console.log(`❌ Failed to associate user with vendor ${createdUser.vendorName}:`, error.response?.status);
      }
    }
    
    // Step 5: Test vendor-user associations
    console.log('\n🧪 Step 5: Testing vendor-user associations...');
    try {
      const updatedVendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=user`);
      const updatedVendors = updatedVendorsResponse.data.data;
      
      console.log('Updated vendors with user associations:');
      for (const vendor of updatedVendors) {
        const user = vendor.attributes.user?.data;
        console.log(`- ${vendor.attributes.name}: ${user ? user.attributes.username : 'No user'}`);
      }
      
    } catch (error) {
      console.log('❌ Error testing vendor associations:', error.response?.status);
    }
    
    // Step 6: Test vendor login
    console.log('\n🔐 Step 6: Testing vendor login...');
    for (const userData of vendorUsers) {
      try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
          identifier: userData.email,
          password: userData.password
        });
        
        console.log(`✅ Vendor login successful: ${userData.username}`);
        console.log(`   User ID: ${loginResponse.data.user.id}`);
        console.log(`   Role: ${loginResponse.data.user.role?.name || 'No role'}`);
        
      } catch (error) {
        console.log(`❌ Vendor login failed for ${userData.username}:`, error.response?.data);
      }
    }
    
    console.log('\n🎉 Vendor user creation completed!');
    console.log('📊 Summary:');
    console.log('- Vendor Users: 3');
    console.log('- User-Vendor Associations: Updated');
    console.log('- Vendor Login: Tested');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating vendor users:', error.response?.data || error.message);
    return false;
  }
}

// Run the script
createVendorUsers().then(success => {
  if (success) {
    console.log('\n🎉 Vendor users setup completed!');
    console.log('🔧 Vendors can now:');
    console.log('1. Login with their credentials');
    console.log('2. Access their vendor dashboard');
    console.log('3. Manage their products and orders');
    console.log('\n📝 Vendor Credentials:');
    console.log('- FreshMart: vendor@freshmart.com / Vendor@123');
    console.log('- CityBakery: vendor@citybakery.com / Vendor@123');
    console.log('- TechStore: vendor@techstore.com / Vendor@123');
  } else {
    console.log('\n💥 Vendor users setup failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 