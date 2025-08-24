const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function fixCouponPermissions() {
  console.log('🔧 Fixing Coupon API Permissions');
  console.log('=================================');

  try {
    // First, let's check if we can access the admin panel
    console.log('\n1️⃣ Checking admin access...');
    
    // We need to get an admin token first
    const adminResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@cityshopping.com', // Replace with your admin email
      password: 'admin123' // Replace with your admin password
    });

    const adminToken = adminResponse.data.jwt;
    console.log('✅ Admin authentication successful');

    // Now let's check the current permissions for the coupon API
    console.log('\n2️⃣ Checking current coupon permissions...');
    
    try {
      const permissionsResponse = await axios.get(`${API_URL}/api/users-permissions/roles`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log('✅ Roles retrieved successfully');
      console.log('Available roles:', permissionsResponse.data.roles.map(role => role.name));
      
    } catch (error) {
      console.log('❌ Could not retrieve roles:', error.response?.data?.message || error.message);
    }

    // Let's try to access the coupon API with admin token
    console.log('\n3️⃣ Testing coupon API with admin token...');
    
    try {
      const couponResponse = await axios.get(`${API_URL}/api/coupons`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log('✅ Coupon API accessible with admin token');
      console.log('Coupons found:', couponResponse.data.data?.length || 0);
      
    } catch (error) {
      console.log('❌ Coupon API still not accessible:', error.response?.data?.message || error.message);
    }

    // Let's test the coupon validation endpoint
    console.log('\n4️⃣ Testing coupon validation endpoint...');
    
    try {
      const validateResponse = await axios.post(`${API_URL}/api/coupons/validate`, {
        couponCode: 'TEST123',
        orderAmount: 100,
        userId: 1
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Coupon validation endpoint working');
      console.log('Response:', validateResponse.data);
      
    } catch (error) {
      console.log('❌ Coupon validation failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('- The coupon API exists but has permission issues');
    console.log('- You need to configure permissions in Strapi admin panel');
    console.log('- Go to: http://localhost:1337/admin');
    console.log('- Navigate to Settings > Users & Permissions Plugin > Roles');
    console.log('- Edit the "Authenticated" role and enable coupon permissions');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    console.log('\n🔧 Manual Fix Required:');
    console.log('1. Open Strapi admin: http://localhost:1337/admin');
    console.log('2. Go to Settings > Users & Permissions Plugin > Roles');
    console.log('3. Edit the "Authenticated" role');
    console.log('4. Enable permissions for "Coupon" content type');
    console.log('5. Save the changes');
  }
}

fixCouponPermissions(); 