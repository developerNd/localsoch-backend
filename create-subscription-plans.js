const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:1337';

const subscriptionPlans = [
  {
    name: "Basic Plan",
    description: "Perfect for small businesses just starting out",
    price: 999,
    currency: "INR",
    duration: 30,
    durationType: "days",
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    features: [
      "Up to 50 products",
      "Basic analytics",
      "Email support",
      "Standard commission rate"
    ],
    maxProducts: 50,
    maxOrders: 100,
    commissionRate: 5.00
  },
  {
    name: "Professional Plan",
    description: "Ideal for growing businesses with moderate sales",
    price: 1999,
    currency: "INR",
    duration: 30,
    durationType: "days",
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    features: [
      "Up to 200 products",
      "Advanced analytics",
      "Priority support",
      "Reduced commission rate",
      "Featured listings"
    ],
    maxProducts: 200,
    maxOrders: 500,
    commissionRate: 3.50
  },
  {
    name: "Enterprise Plan",
    description: "For established businesses with high volume sales",
    price: 3999,
    currency: "INR",
    duration: 30,
    durationType: "days",
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    features: [
      "Unlimited products",
      "Premium analytics",
      "24/7 support",
      "Lowest commission rate",
      "Featured listings",
      "Custom branding",
      "API access"
    ],
    maxProducts: -1,
    maxOrders: -1,
    commissionRate: 2.50
  },
  {
    name: "Annual Basic",
    description: "Basic plan with annual discount",
    price: 9999,
    currency: "INR",
    duration: 365,
    durationType: "days",
    isActive: true,
    isPopular: false,
    sortOrder: 4,
    features: [
      "Up to 50 products",
      "Basic analytics",
      "Email support",
      "Standard commission rate",
      "2 months free"
    ],
    maxProducts: 50,
    maxOrders: 100,
    commissionRate: 5.00
  },
  {
    name: "Annual Professional",
    description: "Professional plan with annual discount",
    price: 19999,
    currency: "INR",
    duration: 365,
    durationType: "days",
    isActive: true,
    isPopular: true,
    sortOrder: 5,
    features: [
      "Up to 200 products",
      "Advanced analytics",
      "Priority support",
      "Reduced commission rate",
      "Featured listings",
      "2 months free"
    ],
    maxProducts: 200,
    maxOrders: 500,
    commissionRate: 3.50
  }
];

async function createSubscriptionPlans() {
  console.log('🌱 Creating subscription plans...');
  
  for (const plan of subscriptionPlans) {
    try {
      console.log(`\n📝 Creating plan: ${plan.name}`);
      console.log('📋 Plan data:');
      console.log(JSON.stringify(plan, null, 2));
      
      const response = await axios.post(`${API_URL}/api/subscription-plans`, {
        data: plan
      });
      
      if (response.data.data) {
        console.log(`✅ Created plan: ${plan.name} (ID: ${response.data.data.id})`);
      } else {
        console.log(`⚠️ Unexpected response for ${plan.name}:`, response.data);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('unique')) {
        console.log(`⏭️ Plan ${plan.name} already exists, skipping...`);
      } else {
        console.error(`❌ Failed to create plan ${plan.name}:`);
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data);
        console.error('Full error:', error.message);
      }
    }
  }
  
  console.log('\n🎉 Subscription plans creation completed!');
}

// Run the creation
createSubscriptionPlans().catch(console.error); 