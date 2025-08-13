const fetch = require('node-fetch');

const API_URL = 'http://localhost:1337';
const API_TOKEN = 'e84e26b9a4c2d8f27bde949afc61d52117e19563be11d5d9ebc8598313d72d1b49d230e28458cfcee1bccd7702ca542a929706c35cde1a62b8f0ab6f185ae74c9ce64c0d8782c15bf4186c29f4fc5c7fdd4cfdd00938a59a636a32cb243b9ca7c94242438ff5fcd2fadbf40a093ea593e96808af49ad97cbeaed977e319614b5';

async function assignProfileImages() {
  try {
    console.log('🔄 Assigning profile images to vendors...');
    
    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test server connection
    const healthCheck = await fetch(`${API_URL}/api/vendors/1`);
    if (!healthCheck.ok) {
      throw new Error('Server not ready');
    }
    console.log('✅ Server is ready');
    
    // Assign coffee beans image to FreshMart (ID: 1)
    console.log('📸 Assigning coffee beans image to FreshMart...');
    const freshmartResponse = await fetch(`${API_URL}/api/vendors/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          profileImage: 30 // coffee-beans.jpg
        }
      })
    });
    
    if (freshmartResponse.ok) {
      console.log('✅ Assigned coffee beans image to FreshMart (ID: 1)');
    } else {
      const error = await freshmartResponse.text();
      console.log('❌ Failed to assign image to FreshMart:', error);
    }
    
    // Assign beautiful picture to CityBakery (ID: 2)
    console.log('📸 Assigning beautiful picture to CityBakery...');
    const citybakeryResponse = await fetch(`${API_URL}/api/vendors/2`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          profileImage: 8 // beautiful-picture
        }
      })
    });
    
    if (citybakeryResponse.ok) {
      console.log('✅ Assigned beautiful picture to CityBakery (ID: 2)');
    } else {
      const error = await citybakeryResponse.text();
      console.log('❌ Failed to assign image to CityBakery:', error);
    }
    
    // Verify the updates
    console.log('\n📋 Verifying updates...');
    const freshmartCheck = await fetch(`${API_URL}/api/vendors/1?populate=profileImage`);
    const citybakeryCheck = await fetch(`${API_URL}/api/vendors/2?populate=profileImage`);
    
    if (freshmartCheck.ok) {
      const freshmartData = await freshmartCheck.json();
      console.log('FreshMart profileImage:', freshmartData.data.profileImage ? `ID: ${freshmartData.data.profileImage.id}` : 'null');
    }
    
    if (citybakeryCheck.ok) {
      const citybakeryData = await citybakeryCheck.json();
      console.log('CityBakery profileImage:', citybakeryData.data.profileImage ? `ID: ${citybakeryData.data.profileImage.id}` : 'null');
    }
    
    console.log('\n🎉 Profile images assignment completed!');
    
  } catch (error) {
    console.error('❌ Error assigning profile images:', error.message);
  }
}

// Run the script
assignProfileImages(); 