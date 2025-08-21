const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

async function addCustomCategoryField() {
  try {
    console.log('🔄 Adding customCategory field to products...');

    // Get all products
    const response = await axios.get(`${STRAPI_URL}/api/products?populate=*`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });

    const products = response.data.data;
    console.log(`📦 Found ${products.length} products to update`);

    // Update each product to add customCategory field (set to null for existing products)
    for (const product of products) {
      try {
        await axios.put(`${STRAPI_URL}/api/products/${product.id}`, {
          data: {
            customCategory: null // Set to null for existing products
          }
        }, {
          headers: { 
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Updated product: ${product.attributes.name}`);
      } catch (error) {
        console.error(`❌ Failed to update product ${product.id}:`, error.response?.data || error.message);
      }
    }

    console.log('🎉 Custom category field migration completed!');
    console.log('📝 New products can now use the "Other" category option with custom category names.');

  } catch (error) {
    console.error('❌ Migration failed:', error.response?.data || error.message);
  }
}

// Run the migration
addCustomCategoryField(); 