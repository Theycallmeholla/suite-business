// Test script to check the enhanced flow API
const fetch = require('node-fetch');

async function testEnhancedFlow() {
  const url = 'http://localhost:3000/api/sites/create-from-gbp-enhanced';
  
  console.log('Testing enhanced flow API...');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add cookie from your browser session here
      },
      body: JSON.stringify({
        locationId: 'locations/15895741961692317638',
        isPlaceId: false,
        generateQuestionsOnly: true,
        industry: 'general'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testEnhancedFlow();
