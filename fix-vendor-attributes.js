const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function fixVendorAttributes() {
  try {
    console.log('🔍 Fixing vendor attributes...');
    
    // First, let's try to get an admin token
    let adminToken = null;
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: 'admin@example.com',
        password: 'admin123'
      });
      adminToken = loginResponse.data.jwt;
      console.log('🔍 Admin token obtained');
    } catch (error) {
      console.log('🔍 Could not get admin token, trying without authentication');
    }
    
    // Vendor data to recreate
    const vendorData = [
      { id: 2, name: 'shop', businessCategoryId: 24 },
      { id: 16, name: 'testq', businessCategoryId: 20 },
      { id: 17, name: 'Test Shop with Category', businessCategoryId: 18 }
    ];
    
    for (const vendor of vendorData) {
      console.log(`🔍 Recreating vendor ${vendor.id}: ${vendor.name}`);
      
      try {
        // First, delete the existing vendor
        if (adminToken) {
          try {
            await axios.delete(`${API_URL}/api/vendors/${vendor.id}`, {
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
              }
            });
            console.log(`✅ Deleted vendor ${vendor.id}`);
          } catch (deleteError) {
            console.log(`⚠️ Could not delete vendor ${vendor.id}:`, deleteError.response?.status);
          }
        }
        
        // Create new vendor with proper data
        const createData = {
          data: {
            name: vendor.name,
            businessCategory: vendor.businessCategoryId,
            status: 'approved',
            isActive: true,
            isApproved: true,
            // Add other required fields
            address: 'Sample Address',
            contact: '+91 98765 43210',
            whatsapp: '+91 98765 43210',
            city: 'Sample City',
            state: 'Sample State',
            pincode: '123456',
            email: 'sample@example.com',
            description: 'Sample description'
          }
        };
        
        const createResponse = await axios.post(`${API_URL}/api/vendors`, createData, {
          headers: {
            ...(adminToken && { 'Authorization': `Bearer ${adminToken}` }),
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Created vendor ${vendor.id}:`, createResponse.data.data?.id);
        
        // Verify the creation
        const verifyResponse = await axios.get(`${API_URL}/api/vendors/${createResponse.data.data?.id || vendor.id}?populate=businessCategory`);
        const vendorData = verifyResponse.data.data;
        console.log(`🔍 Verification - Vendor ${vendor.id}:`, {
          name: vendorData.attributes?.name,
          businessCategory: vendorData.attributes?.businessCategory?.data?.attributes?.name
        });
        
      } catch (error) {
        console.error(`❌ Error recreating vendor ${vendor.id}:`, error.response?.data || error.message);
      }
    }
    
    console.log('🔍 Vendor attributes fix completed');
    
  } catch (error) {
    console.error('Error fixing vendor attributes:', error.response?.data || error.message);
  }
}

fixVendorAttributes(); 