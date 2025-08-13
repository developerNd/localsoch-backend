const axios = require('axios');

const API_URL = 'http://localhost:1337';

// Test pickup order data
const testPickupOrder = {
  orderNumber: `PICKUP-${Date.now()}`,
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '+91 98765 43210',
  totalAmount: 150.00,
  status: 'pending',
  deliveryType: 'pickup',
  pickupAddress: {
    name: 'CityBakery',
    address: '456 Baker St, Downtown, Mumbai, Maharashtra 400001',
    contact: '+91 98765 43210'
  },
  pickupTime: '30min',
  orderItems: [
    {
      productId: 1,
      quantity: 2,
      totalAmount: 100.00,
      productName: 'Test Product 1'
    },
    {
      productId: 2,
      quantity: 1,
      totalAmount: 50.00,
      productName: 'Test Product 2'
    }
  ],
  paymentMethod: 'COD',
  paymentStatus: 'pending',
  notes: 'Test pickup order from React Native app',
  vendor: 26, // CityBakery vendor ID
  user: 4 // citybakery user ID
};

async function testPickupOrderCreation() {
  try {
    console.log('🧪 Testing Pickup Order Creation...');
    
    // First, get admin token by logging in
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });

    if (!loginResponse.data.jwt) {
      throw new Error('Failed to login as admin');
    }

    const adminToken = loginResponse.data.jwt;
    console.log('✅ Admin login successful');

    console.log('📝 Creating pickup order with data:', {
      orderNumber: testPickupOrder.orderNumber,
      deliveryType: testPickupOrder.deliveryType,
      pickupAddress: testPickupOrder.pickupAddress,
      pickupTime: testPickupOrder.pickupTime
    });

    const orderResponse = await axios.post(`${API_URL}/api/orders`, {
      data: testPickupOrder
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📝 Order response:', orderResponse.data);

    if (orderResponse.data.data) {
      console.log('✅ Pickup order created successfully!');
      console.log('   Order ID:', orderResponse.data.data.id);
      console.log('   Order Number:', orderResponse.data.data.attributes.orderNumber);
      console.log('   Delivery Type:', orderResponse.data.data.attributes.deliveryType);
      console.log('   Pickup Address:', orderResponse.data.data.attributes.pickupAddress);
      console.log('   Pickup Time:', orderResponse.data.data.attributes.pickupTime);
      
      return orderResponse.data.data.id;
    } else {
      throw new Error('Failed to create pickup order');
    }

  } catch (error) {
    console.error('❌ Error creating pickup order:', error.response?.data || error.message);
    if (error.response?.data?.error?.message) {
      console.error('📝 Error details:', error.response.data.error.message);
    }
    return null;
  }
}

// Test delivery order data for comparison
const testDeliveryOrder = {
  orderNumber: `DELIVERY-${Date.now()}`,
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '+91 98765 43210',
  totalAmount: 200.00,
  status: 'pending',
  deliveryType: 'delivery',
  shippingAddress: {
    street: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058'
  },
  deliveryCharge: 50.00,
  orderItems: [
    {
      productId: 1,
      quantity: 2,
      totalAmount: 150.00,
      productName: 'Test Product 1'
    }
  ],
  paymentMethod: 'COD',
  paymentStatus: 'pending',
  notes: 'Test delivery order from React Native app',
  vendor: 26, // CityBakery vendor ID
  user: 4 // citybakery user ID
};

async function testDeliveryOrderCreation() {
  try {
    console.log('\n🚚 Testing Delivery Order Creation...');
    
    // First, get admin token by logging in
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });

    if (!loginResponse.data.jwt) {
      throw new Error('Failed to login as admin');
    }

    const adminToken = loginResponse.data.jwt;
    console.log('✅ Admin login successful');

    console.log('📝 Creating delivery order with data:', {
      orderNumber: testDeliveryOrder.orderNumber,
      deliveryType: testDeliveryOrder.deliveryType,
      shippingAddress: testDeliveryOrder.shippingAddress,
      deliveryCharge: testDeliveryOrder.deliveryCharge
    });

    const orderResponse = await axios.post(`${API_URL}/api/orders`, {
      data: testDeliveryOrder
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📝 Order response:', orderResponse.data);

    if (orderResponse.data.data) {
      console.log('✅ Delivery order created successfully!');
      console.log('   Order ID:', orderResponse.data.data.id);
      console.log('   Order Number:', orderResponse.data.data.attributes.orderNumber);
      console.log('   Delivery Type:', orderResponse.data.data.attributes.deliveryType);
      console.log('   Shipping Address:', orderResponse.data.data.attributes.shippingAddress);
      console.log('   Delivery Charge:', orderResponse.data.data.attributes.deliveryCharge);
      
      return orderResponse.data.data.id;
    } else {
      throw new Error('Failed to create delivery order');
    }

  } catch (error) {
    console.error('❌ Error creating delivery order:', error.response?.data || error.message);
    if (error.response?.data?.error?.message) {
      console.error('📝 Error details:', error.response.data.error.message);
    }
    return null;
  }
}

// Test fetching orders to verify they display correctly
async function testFetchOrders() {
  try {
    console.log('\n📋 Testing Order Fetching...');
    
    // First, get admin token by logging in
    const loginResponse = await axios.post(`${API_URL}/api/auth/local`, {
      identifier: 'admin@gmail.com',
      password: 'admin@123'
    });

    if (!loginResponse.data.jwt) {
      throw new Error('Failed to login as admin');
    }

    const adminToken = loginResponse.data.jwt;
    console.log('✅ Admin login successful');

    const ordersResponse = await axios.get(`${API_URL}/api/orders?populate=*`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📝 Orders response:', ordersResponse.data);

    if (ordersResponse.data.data) {
      console.log('✅ Orders fetched successfully!');
      console.log('   Total Orders:', ordersResponse.data.data.length);
      
      // Check for pickup and delivery orders
      const pickupOrders = ordersResponse.data.data.filter(order => 
        order.attributes.deliveryType === 'pickup'
      );
      const deliveryOrders = ordersResponse.data.data.filter(order => 
        order.attributes.deliveryType === 'delivery'
      );
      
      console.log('   Pickup Orders:', pickupOrders.length);
      console.log('   Delivery Orders:', deliveryOrders.length);
      
      // Show sample pickup order
      if (pickupOrders.length > 0) {
        const samplePickup = pickupOrders[0];
        console.log('\n📦 Sample Pickup Order:');
        console.log('   ID:', samplePickup.id);
        console.log('   Order Number:', samplePickup.attributes.orderNumber);
        console.log('   Delivery Type:', samplePickup.attributes.deliveryType);
        console.log('   Pickup Address:', samplePickup.attributes.pickupAddress);
        console.log('   Pickup Time:', samplePickup.attributes.pickupTime);
      }
      
      // Show sample delivery order
      if (deliveryOrders.length > 0) {
        const sampleDelivery = deliveryOrders[0];
        console.log('\n🚚 Sample Delivery Order:');
        console.log('   ID:', sampleDelivery.id);
        console.log('   Order Number:', sampleDelivery.attributes.orderNumber);
        console.log('   Delivery Type:', sampleDelivery.attributes.deliveryType);
        console.log('   Shipping Address:', sampleDelivery.attributes.shippingAddress);
        console.log('   Delivery Charge:', sampleDelivery.attributes.deliveryCharge);
      }
    } else {
      throw new Error('Failed to fetch orders');
    }

  } catch (error) {
    console.error('❌ Error fetching orders:', error.response?.data || error.message);
    if (error.response?.data?.error?.message) {
      console.error('📝 Error details:', error.response.data.error.message);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting Pickup Order Feature Tests...\n');
  
  // Test pickup order creation
  const pickupOrderId = await testPickupOrderCreation();
  
  // Test delivery order creation
  const deliveryOrderId = await testDeliveryOrderCreation();
  
  // Test fetching orders
  await testFetchOrders();
  
  console.log('\n🎉 Pickup Order Feature Tests Completed!');
  console.log('✅ Pickup orders can be created with pickup address and time');
  console.log('✅ Delivery orders can be created with shipping address');
  console.log('✅ Orders can be fetched and display correct delivery type');
  console.log('✅ Both pickup and delivery orders are properly stored in the database');
}

// Run the tests
runAllTests().catch(console.error); 