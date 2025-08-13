const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function debugVendorStructure() {
  try {
    console.log('🔍 Debugging vendor structure...');
    
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
    
    // Step 2: Get vendors and examine structure
    console.log('\n🏪 Step 2: Examining vendor structure...');
    const vendorsResponse = await axios.get(`${API_URL}/api/vendors`);
    const vendors = vendorsResponse.data.data;
    console.log(`Found ${vendors.length} vendors`);
    
    console.log('\nVendor data structure:');
    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      console.log(`\nVendor ${i + 1}:`);
      console.log('  Raw data:', JSON.stringify(vendor, null, 2));
      console.log('  ID:', vendor.id);
      console.log('  Attributes:', vendor.attributes ? 'Present' : 'Missing');
      if (vendor.attributes) {
        console.log('  Attribute keys:', Object.keys(vendor.attributes));
        console.log('  Name:', vendor.attributes.name);
        console.log('  User:', vendor.attributes.user);
      }
    }
    
    // Step 3: Get users
    console.log('\n👥 Step 3: Getting users...');
    const usersResponse = await axios.get(`${API_URL}/api/users`, { headers });
    const users = usersResponse.data;
    console.log(`Found ${users.length} users`);
    
    console.log('\nUser data:');
    for (const user of users) {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    }
    
    // Step 4: Try to associate vendors with users
    console.log('\n🔗 Step 4: Associating vendors with users...');
    const vendorMappings = [
      { vendorIndex: 0, userEmail: 'vendor@freshmart.com' },
      { vendorIndex: 1, userEmail: 'vendor@citybakery.com' },
      { vendorIndex: 2, userEmail: 'vendor@techstore.com' }
    ];
    
    for (const mapping of vendorMappings) {
      try {
        const vendor = vendors[mapping.vendorIndex];
        const user = users.find(u => u.email === mapping.userEmail);
        
        if (vendor && user) {
          console.log(`\n🔗 Associating vendor ID ${vendor.id} with user ${user.email} (ID: ${user.id})`);
          
          // Update vendor with user association
          const updateResponse = await axios.put(`${API_URL}/api/vendors/${vendor.id}`, {
            data: {
              user: user.id
            }
          }, { headers });
          
          console.log(`✅ Successfully associated vendor with user ${user.username}`);
          console.log('Update response:', updateResponse.data);
          
        } else {
          console.log(`❌ Could not find vendor or user for mapping: ${mapping.vendorIndex} -> ${mapping.userEmail}`);
          if (!vendor) console.log(`   Vendor not found at index ${mapping.vendorIndex}`);
          if (!user) console.log(`   User not found: ${mapping.userEmail}`);
        }
        
      } catch (error) {
        console.log(`❌ Error associating vendor ${mapping.vendorIndex}:`, error.response?.status, error.response?.data);
      }
    }
    
    // Step 5: Verify final state
    console.log('\n✅ Step 5: Verifying final state...');
    try {
      const finalVendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=user`);
      const finalVendors = finalVendorsResponse.data.data;
      
      console.log('Final vendor-user associations:');
      for (const vendor of finalVendors) {
        const user = vendor.attributes?.user?.data;
        if (user) {
          console.log(`✅ Vendor ID ${vendor.id} -> ${user.attributes.username} (${user.attributes.email})`);
        } else {
          console.log(`❌ Vendor ID ${vendor.id} -> No user associated`);
        }
      }
      
    } catch (error) {
      console.log('❌ Error verifying final state:', error.response?.status);
    }
    
    console.log('\n🎉 Debug and fix completed!');
    
  } catch (error) {
    console.error('❌ Error debugging vendor structure:', error.response?.data || error.message);
  }
}

debugVendorStructure(); 