// Test script to check all vendors and their product statuses
const axios = require('axios');

const API_URL = 'http://localhost:1337';

async function testAllVendorsProducts() {
  try {
    console.log('🧪 Testing All Vendors and Their Products...\n');

    // Test 1: Get all vendors
    console.log('1️⃣ Getting All Vendors...');
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors?populate=*`);
      console.log('✅ Vendors endpoint working');
      console.log('📊 Total vendors:', vendorsResponse.data.data?.length || 0);
      
      if (vendorsResponse.data.data && vendorsResponse.data.data.length > 0) {
        console.log('\n📝 Vendor details with product counts:');
        for (const vendor of vendorsResponse.data.data) {
          console.log(`\n🔍 Vendor ID: ${vendor.id}, Name: ${vendor.name || vendor.shopName}`);
          console.log(`  Backend productsCount: ${vendor.productsCount || 'N/A'}`);
          
          // Get products for this vendor
          try {
            const productsResponse = await axios.get(`${API_URL}/api/products?filters[vendor][$eq]=${vendor.id}&populate=*`);
            const products = productsResponse.data.data || [];
            
            console.log(`  Total products: ${products.length}`);
            
            if (products.length > 0) {
              const activeCount = products.filter(p => p.isActive === true).length;
              const inactiveCount = products.filter(p => p.isActive === false).length;
              const undefinedActiveCount = products.filter(p => p.isActive === undefined).length;
              
              console.log(`  Active products: ${activeCount}`);
              console.log(`  Inactive products: ${inactiveCount}`);
              console.log(`  Undefined isActive: ${undefinedActiveCount}`);
              
              // Show product details if there are inactive ones
              if (inactiveCount > 0 || undefinedActiveCount > 0) {
                console.log(`  Product details:`);
                products.forEach((product, index) => {
                  console.log(`    ${index + 1}. ID: ${product.id}, Name: ${product.name}, isActive: ${product.isActive}, status: ${product.status}`);
                });
              }
            }
          } catch (productsError) {
            console.log(`  ❌ Error fetching products: ${productsError.message}`);
          }
        }
      }
    } catch (error) {
      console.log('❌ Vendors endpoint failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 All Vendors Products Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAllVendorsProducts(); 