'use strict';

const axios = require('axios');

// Set your Strapi API token here
const STRAPI_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU1MDA1NzkyLCJleHAiOjE3NTc1OTc3OTJ9.xccywGmyeOVI24XgE48zwOT1_Qiw_LHAV6qOQcpy9mc';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function seedButtonConfigs() {
  try {
    console.log('Starting button configuration seeding...');

    // Get all vendors
    const vendorsResponse = await axios.get(`${STRAPI_URL}/api/vendors`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });

    if (vendorsResponse.data.data.length === 0) {
      console.log('No vendors found. Please create vendors first.');
      return;
    }

    console.log(`Found ${vendorsResponse.data.data.length} vendors. Updating button configurations...`);

    for (const vendor of vendorsResponse.data.data) {
      try {
        // Create default button configuration
        const buttonConfig = {
          messageButton: {
            enabled: true,
            label: 'Message',
            icon: 'message-circle',
            action: 'message',
            color: 'primary',
            order: 1
          },
                  callButton: {
          enabled: true,
          label: 'Call',
          icon: 'phone',
          action: 'call',
          value: vendor.attributes?.contact || '',
          color: 'default',
          order: 2
        },
          whatsappButton: {
            enabled: false,
            label: 'WhatsApp',
            icon: 'message-square',
            action: 'whatsapp',
            value: '',
            color: 'success',
            order: 3
          },
          emailButton: {
            enabled: false,
            label: 'Email',
            icon: 'mail',
            action: 'email',
            value: '',
            color: 'secondary',
            order: 4
          },
          websiteButton: {
            enabled: false,
            label: 'Website',
            icon: 'globe',
            action: 'website',
            value: '',
            color: 'outline',
            order: 5
          }
        };

        // Initialize button clicks tracking
        const buttonClicks = {
          messageClicks: 0,
          callClicks: 0,
          whatsappClicks: 0,
          emailClicks: 0,
          websiteClicks: 0,
          totalClicks: 0,
          lastUpdated: new Date()
        };

        // Update vendor with button configuration and clicks tracking
        await axios.put(`${STRAPI_URL}/api/vendors/${vendor.id}`, {
          data: {
            buttonConfig,
            buttonClicks
          }
        }, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });

        console.log(`✅ Updated button config for vendor: ${vendor.attributes?.name || vendor.id}`);

      } catch (error) {
        console.error(`❌ Error updating vendor ${vendor.attributes?.name || vendor.id}:`, error.response?.data || error.message);
      }
    }

    console.log('Button configuration seeding complete!');

  } catch (error) {
    console.error('Error during button configuration seeding:', error.response?.data || error);
    process.exit(1);
  }
}

seedButtonConfigs().catch((err) => {
  console.error(err);
  process.exit(1);
}); 