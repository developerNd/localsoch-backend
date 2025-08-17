// Using built-in fetch (Node.js 18+)

async function testAnalyticsEndpoint() {
  try {
    console.log('🧪 Testing Analytics Endpoint...');
    
    const response = await fetch('http://localhost:1337/api/analytics/dashboard-stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📊 Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analytics Data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait a bit for Strapi to start up
setTimeout(testAnalyticsEndpoint, 5000); 