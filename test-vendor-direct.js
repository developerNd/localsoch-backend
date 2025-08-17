const strapi = require('@strapi/strapi');

async function testVendorDirect() {
  try {
    console.log('🔍 Testing vendor data directly through Strapi...');
    
    // Initialize Strapi
    await strapi().load();
    
    // Test direct entity service access
    console.log('\n🔍 Test 1: Direct entity service access');
    const vendors = await strapi.entityService.findMany('api::vendor.vendor', {
      populate: ['businessCategory']
    });
    
    console.log('Total vendors found:', vendors.length);
    
    if (vendors.length > 0) {
      vendors.forEach((vendor, index) => {
        console.log(`Vendor ${index + 1} (ID: ${vendor.id}):`, {
          name: vendor.name,
          businessCategory: vendor.businessCategory?.name || 'None',
          businessCategoryId: vendor.businessCategory?.id
        });
      });
    }
    
    // Test specific vendor
    console.log('\n🔍 Test 2: Specific vendor (ID: 2)');
    const vendor2 = await strapi.entityService.findOne('api::vendor.vendor', 2, {
      populate: ['businessCategory']
    });
    
    console.log('Vendor 2:', {
      id: vendor2?.id,
      name: vendor2?.name,
      businessCategory: vendor2?.businessCategory?.name || 'None'
    });
    
    await strapi().destroy();
    
  } catch (error) {
    console.error('Error testing vendor direct access:', error);
  }
}

testVendorDirect(); 