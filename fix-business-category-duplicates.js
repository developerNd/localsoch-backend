const axios = require('axios');

const API_URL = 'http://localhost:1337';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzU1NDE1NTc2LCJleHAiOjE3NTgwMDc1NzZ9.73f0lYmraq3e7YisXYifXQID8GORsd14eonomF7obGI';

async function fixBusinessCategoryDuplicates() {
  try {
    console.log('🔧 Fixing business category duplicates...');
    
    // Get all business categories (including unpublished)
    const response = await axios.get(`${API_URL}/api/business-categories?publicationState=preview&pagination[pageSize]=100`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    const categories = response.data.data;
    console.log(`📋 Found ${categories.length} business categories (including unpublished)`);
    
    // Group categories by name
    const categoriesByName = {};
    categories.forEach(cat => {
      const name = cat.attributes.name;
      if (!categoriesByName[name]) {
        categoriesByName[name] = [];
      }
      categoriesByName[name].push(cat);
    });
    
    // Find duplicates
    const duplicates = [];
    Object.entries(categoriesByName).forEach(([name, cats]) => {
      if (cats.length > 1) {
        console.log(`⚠️  Found duplicates for "${name}":`);
        cats.forEach(cat => {
          console.log(`    ID: ${cat.id}, Published: ${cat.attributes.publishedAt ? 'Yes' : 'No'}`);
        });
        duplicates.push({ name, categories: cats });
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }
    
    // Delete unpublished duplicates
    console.log('\n🗑️  Deleting unpublished duplicates...');
    for (const duplicate of duplicates) {
      const unpublished = duplicate.categories.filter(cat => !cat.attributes.publishedAt);
      const published = duplicate.categories.filter(cat => cat.attributes.publishedAt);
      
      if (unpublished.length > 0 && published.length > 0) {
        console.log(`📝 For "${duplicate.name}":`);
        console.log(`   Keeping published ID: ${published[0].id}`);
        
        for (const unpub of unpublished) {
          console.log(`   Deleting unpublished ID: ${unpub.id}`);
          try {
            await axios.delete(`${API_URL}/api/business-categories/${unpub.id}`, {
              headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
              }
            });
            console.log(`   ✅ Deleted ID: ${unpub.id}`);
          } catch (error) {
            console.log(`   ❌ Failed to delete ID: ${unpub.id} - ${error.response?.data?.error?.message || error.message}`);
          }
        }
      }
    }
    
    console.log('\n✅ Business category duplicates fixed!');
    
    // Verify the fix
    const verifyResponse = await axios.get(`${API_URL}/api/business-categories?publicationState=preview&pagination[pageSize]=100`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    const finalCategories = verifyResponse.data.data;
    console.log(`\n📊 Final business categories: ${finalCategories.length}`);
    finalCategories.forEach(cat => {
      console.log(`   ID: ${cat.id}, Name: ${cat.attributes.name}, Published: ${cat.attributes.publishedAt ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing business category duplicates:', error.response?.data || error.message);
  }
}

fixBusinessCategoryDuplicates(); 