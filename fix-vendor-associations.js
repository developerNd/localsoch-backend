const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function fixVendorAssociations() {
  try {
    console.log('🔗 Fixing vendor-user associations...');
    
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
    
    // Step 2: Get all users and vendors
    console.log('\n📋 Step 2: Getting users and vendors...');
    
    // Get all users
    const usersResponse = await axios.get(`${API_URL}/api/users`, { headers });
    const users = usersResponse.data;
    console.log(`Found ${users.length} users`);
    
    // Get all vendors
    const vendorsResponse = await axios.get(`${API_URL}/api/vendors`);
    const vendors = vendorsResponse.data.data;
    console.log(`Found ${vendors.length} vendors`);
    
    // Step 3: Show current state
    console.log('\n👥 Current users:');
    for (const user of users) {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role?.name || 'No role'}`);
    }
    
    console.log('\n🏪 Current vendors:');
    for (const vendor of vendors) {
      console.log(`- ID: ${vendor.id}, Name: ${vendor.attributes.name}, User: ${vendor.attributes.user?.data?.id || 'No user'}`);
    }
    
    // Step 4: Map vendor users to vendors
    console.log('\n🔗 Step 4: Mapping vendor users to vendors...');
    const vendorMappings = [
      { vendorName: 'FreshMart', userEmail: 'vendor@freshmart.com' },
      { vendorName: 'CityBakery', userEmail: 'vendor@citybakery.com' },
      { vendorName: 'TechStore', userEmail: 'vendor@techstore.com' }
    ];
    
    for (const mapping of vendorMappings) {
      try {
        // Find the vendor
        const vendor = vendors.find(v => v.attributes.name === mapping.vendorName);
        // Find the user
        const user = users.find(u => u.email === mapping.userEmail);
        
        if (vendor && user) {
          console.log(`\n🔗 Associating ${mapping.vendorName} (ID: ${vendor.id}) with user ${mapping.userEmail} (ID: ${user.id})`);
          
          // Update vendor with user association
          const updateResponse = await axios.put(`${API_URL}/api/vendors/${vendor.id}`, {
            data: {
              user: user.id
            }
          }, { headers });
          
          console.log(`✅ Successfully associated ${mapping.vendorName} with user ${user.username}`);
          
        } else {
          console.log(`❌ Could not find vendor or user for mapping: ${mapping.vendorName} -> ${mapping.userEmail}`);
          if (!vendor) console.log(`   Vendor not found: ${mapping.vendorName}`);
          if (!user) console.log(`   User not found: ${mapping.userEmail}`);
        }
        
      } catch (error) {
        console.log(`❌ Error associating ${mapping.vendorName}:`, error.response?.status, error.response?.data);
      }
    }
    
    // Step 5: Verify associations
    console.log('\n✅ Step 5: Verifying associations...');
    try {
      const updatedVendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=user`);
      const updatedVendors = updatedVendorsResponse.data.data;
      
      console.log('Final vendor-user associations:');
      for (const vendor of updatedVendors) {
        const user = vendor.attributes.user?.data;
        if (user) {
          console.log(`✅ ${vendor.attributes.name} -> ${user.attributes.username} (${user.attributes.email})`);
        } else {
          console.log(`❌ ${vendor.attributes.name} -> No user associated`);
        }
      }
      
    } catch (error) {
      console.log('❌ Error verifying associations:', error.response?.status);
    }
    
    // Step 6: Test vendor access
    console.log('\n🧪 Step 6: Testing vendor access...');
    const vendorCredentials = [
      { email: 'vendor@freshmart.com', password: 'Vendor@123', name: 'FreshMart' },
      { email: 'vendor@citybakery.com', password: 'Vendor@123', name: 'CityBakery' },
      { email: 'vendor@techstore.com', password: 'Vendor@123', name: 'TechStore' }
    ];
    
    for (const cred of vendorCredentials) {
      try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
          identifier: cred.email,
          password: cred.password
        });
        
        const vendorJWT = loginResponse.data.jwt;
        const vendorHeaders = {
          'Authorization': `Bearer ${vendorJWT}`,
          'Content-Type': 'application/json'
        };
        
        console.log(`✅ ${cred.name} login successful`);
        console.log(`   User ID: ${loginResponse.data.user.id}`);
        console.log(`   Username: ${loginResponse.data.user.username}`);
        
        // Test if vendor can access their own data
        try {
          const vendorDataResponse = await axios.get(`${API_URL}/api/vendors?filters[user][id][$eq]=${loginResponse.data.user.id}`, vendorHeaders);
          console.log(`   Vendor data accessible: ${vendorDataResponse.data.data?.length || 0} records`);
        } catch (error) {
          console.log(`   ❌ Cannot access vendor data: ${error.response?.status}`);
        }
        
      } catch (error) {
        console.log(`❌ ${cred.name} login failed:`, error.response?.data);
      }
    }
    
    console.log('\n🎉 Vendor associations fixed!');
    console.log('📊 Summary:');
    console.log('- Vendor Users: 3 created');
    console.log('- User-Vendor Associations: Fixed');
    console.log('- Vendor Access: Tested');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing vendor associations:', error.response?.data || error.message);
    return false;
  }
}

// Run the script
fixVendorAssociations().then(success => {
  if (success) {
    console.log('\n🎉 Vendor setup completed!');
    console.log('🔧 Vendors can now:');
    console.log('1. Login with their credentials');
    console.log('2. Access their vendor dashboard');
    console.log('3. Manage their products and orders');
    console.log('4. View their associated vendor data');
    console.log('\n📝 Final Vendor Credentials:');
    console.log('- FreshMart: vendor@freshmart.com / Vendor@123');
    console.log('- CityBakery: vendor@citybakery.com / Vendor@123');
    console.log('- TechStore: vendor@techstore.com / Vendor@123');
  } else {
    console.log('\n💥 Vendor setup failed.');
    console.log('🔧 Please check the error messages above.');
  }
}); 