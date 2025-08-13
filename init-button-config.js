const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

async function initButtonConfig() {
  try {
    console.log('Initializing button configuration...\n');

    // Get vendors
    const vendorsResponse = await axios.get(`${STRAPI_URL}/api/vendors`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });

    console.log(`Found ${vendorsResponse.data.data.length} vendors`);

    for (const vendor of vendorsResponse.data.data) {
      try {
        console.log(`\nInitializing vendor: ${vendor.name} (ID: ${vendor.id})`);

        // Create button configuration
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
            value: vendor.contact || '',
            color: 'default',
            order: 2
          }
        };

        // Initialize button clicks
        const buttonClicks = {
          messageClicks: 0,
          callClicks: 0,
          whatsappClicks: 0,
          emailClicks: 0,
          websiteClicks: 0,
          totalClicks: 0,
          lastUpdated: new Date()
        };

        // Update vendor
        const updateResponse = await axios.put(`${STRAPI_URL}/api/vendors/${vendor.id}`, {
          data: {
            buttonConfig,
            buttonClicks
          }
        }, {
          headers: { 
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`✅ Successfully initialized vendor: ${vendor.name}`);

      } catch (error) {
        console.error(`❌ Error initializing vendor ${vendor.name}:`, error.response?.data || error.message);
      }
    }

    console.log('\nButton configuration initialization complete!');

  } catch (error) {
    console.error('Error during initialization:', error.response?.data || error);
  }
}

initButtonConfig(); 