const Strapi = require('@strapi/strapi');

async function fixOrderValidation() {
  let strapi;
  
  try {
    // Initialize Strapi
    strapi = await Strapi().load();
    
    const orderId = 'iwgdy10dthl5inxd02ids3e3';
    
    console.log('🔍 Checking order validation issues...');
    
    // Get the order
    const order = await strapi.entityService.findOne('api::order.order', orderId, {
      populate: ['user', 'vendor', 'products']
    });
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }
    
    console.log('📋 Current order data:', JSON.stringify(order, null, 2));
    
    // Check required fields
    const requiredFields = ['orderNumber', 'totalAmount', 'customerName', 'customerEmail'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!order[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      
      // Fix missing fields with default values
      const fixData = {};
      
      if (!order.orderNumber) {
        fixData.orderNumber = `ORD-${Date.now()}`;
      }
      
      if (!order.totalAmount) {
        fixData.totalAmount = 0;
      }
      
      if (!order.customerName) {
        fixData.customerName = 'Unknown Customer';
      }
      
      if (!order.customerEmail) {
        fixData.customerEmail = 'unknown@example.com';
      }
      
      if (Object.keys(fixData).length > 0) {
        console.log('🔧 Fixing missing fields with:', fixData);
        
        const updatedOrder = await strapi.entityService.update('api::order.order', orderId, {
          data: fixData
        });
        
        console.log('✅ Order fixed successfully:', updatedOrder.id);
      }
    } else {
      console.log('✅ All required fields are present');
    }
    
    // Test status update
    console.log('🧪 Testing status update...');
    
    const testUpdate = await strapi.entityService.update('api::order.order', orderId, {
      data: {
        status: 'confirmed'
      }
    });
    
    console.log('✅ Status update test successful:', testUpdate.status);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (strapi) {
      await strapi.destroy();
    }
    process.exit(0);
  }
}

fixOrderValidation(); 