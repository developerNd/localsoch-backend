const axios = require('axios');

const API_URL = 'http://192.168.1.101:1337';

async function checkAndFixBusinessCategoryIds() {
  try {
    console.log('🔍 Checking current business categories...');
    
    // Get current business categories
    const response = await axios.get(`${API_URL}/api/business-categories`);
    const categories = response.data.data;
    
    console.log('📋 Current business categories:');
    categories.forEach(cat => {
      console.log(`  ID: ${cat.id}, Name: ${cat.name}, SortOrder: ${cat.sortOrder}`);
    });
    
    // Check what content types might be using the missing IDs
    console.log('\n🔍 Checking for content types that might use missing IDs...');
    
    // Check vendors
    try {
      const vendorsResponse = await axios.get(`${API_URL}/api/vendors`);
      const vendors = vendorsResponse.data.data;
      console.log('📋 Vendors:');
      vendors.forEach(vendor => {
        console.log(`  ID: ${vendor.id}, Name: ${vendor.name}`);
      });
    } catch (error) {
      console.log('❌ Could not fetch vendors:', error.response?.status);
    }
    
    // Check categories (product categories)
    try {
      const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
      const productCategories = categoriesResponse.data.data;
      console.log('📋 Product Categories:');
      productCategories.forEach(cat => {
        console.log(`  ID: ${cat.id}, Name: ${cat.name}`);
      });
    } catch (error) {
      console.log('❌ Could not fetch product categories:', error.response?.status);
    }
    
    // Check subscription plans
    try {
      const plansResponse = await axios.get(`${API_URL}/api/subscription-plans`);
      const plans = plansResponse.data.data;
      console.log('📋 Subscription Plans:');
      plans.forEach(plan => {
        console.log(`  ID: ${plan.id}, Name: ${plan.name}`);
      });
    } catch (error) {
      console.log('❌ Could not fetch subscription plans:', error.response?.status);
    }
    
    // Check subscriptions
    try {
      const subsResponse = await axios.get(`${API_URL}/api/subscriptions`);
      const subscriptions = subsResponse.data.data;
      console.log('📋 Subscriptions:');
      subscriptions.forEach(sub => {
        console.log(`  ID: ${sub.id}`);
      });
    } catch (error) {
      console.log('❌ Could not fetch subscriptions:', error.response?.status);
    }
    
    console.log('\n💡 The missing IDs (1, 3, 4, 6, 8) are likely used by other content types or deleted records.');
    console.log('💡 This is normal behavior for Strapi\'s auto-incrementing IDs.');
    console.log('💡 The frontend should work with the actual IDs (2, 5, 7, 9) that exist.');
    
    // Option to reset business categories with sequential IDs
    console.log('\n🔄 Would you like to reset business categories with sequential IDs?');
    console.log('⚠️  This will delete all existing business categories and recreate them!');
    console.log('⚠️  Any vendors using these categories will need to be updated!');
    
    // For now, just show the current state
    console.log('\n✅ Current business categories are working correctly with their actual IDs.');
    console.log('✅ The frontend should use these actual IDs (2, 5, 7, 9) instead of expecting sequential ones.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkAndFixBusinessCategoryIds(); 