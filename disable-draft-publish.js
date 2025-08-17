const axios = require('axios');

const API_URL = 'http://localhost:1337';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzU1NDE1NTc2LCJleHAiOjE3NTgwMDc1NzZ9.73f0lYmraq3e7YisXYifXQID8GORsd14eonomF7obGI';

async function disableDraftPublish() {
  try {
    console.log('🔧 Disabling draft & publish for business categories...');
    
    // Get the current content type builder schema
    const response = await axios.get(`${API_URL}/content-type-builder/schema`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    const schema = response.data.data;
    console.log('📋 Current schema retrieved');
    
    // Find the business category content type
    const businessCategoryType = schema.contentTypes.find(
      type => type.uid === 'api::business-category.business-category'
    );
    
    if (!businessCategoryType) {
      console.log('❌ Business category content type not found in schema');
      return;
    }
    
    console.log('✅ Found business category content type');
    console.log('📝 Current draftAndPublish setting:', businessCategoryType.options?.draftAndPublish);
    
    // Disable draft & publish
    if (businessCategoryType.options) {
      businessCategoryType.options.draftAndPublish = false;
    } else {
      businessCategoryType.options = { draftAndPublish: false };
    }
    
    console.log('🔧 Updated draftAndPublish to false');
    
    // Update the schema
    const updateResponse = await axios.post(`${API_URL}/content-type-builder/update-schema`, {
      data: schema
    }, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Schema updated successfully');
    console.log('🔄 Please restart the Strapi server to apply changes');
    
  } catch (error) {
    console.error('❌ Error disabling draft & publish:', error.response?.data || error.message);
  }
}

disableDraftPublish(); 