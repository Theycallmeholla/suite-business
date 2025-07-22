/**
 * Test Enhanced Site Generation API
 * 
 * **Created**: December 28, 2024, 8:25 PM CST
 * **Last Updated**: December 28, 2024, 8:25 PM CST
 * 
 * Usage: node scripts/test-enhanced-api.js
 */

require('dotenv').config();

const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001';

// Test Place ID (Air Tech of Houston AC & Plumbing)
const TEST_PLACE_ID = 'ChIJnepQB1XGQIYRy455cw3qD-Q';

async function testEnhancedAPI() {
  console.log('🧪 Testing Enhanced Site Generation API...\n');

  // Step 1: Test question generation
  console.log('Step 1: Generating questions...');
  
  try {
    const questionsResponse = await fetch(`${API_URL}/api/sites/create-from-gbp-enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: TEST_PLACE_ID,
        generateQuestionsOnly: true,
        isPlaceId: true,
      }),
    });

    if (!questionsResponse.ok) {
      const error = await questionsResponse.text();
      throw new Error(`API Error: ${questionsResponse.status} - ${error}`);
    }

    const questionsData = await questionsResponse.json();
    
    console.log('✅ Questions generated successfully!');
    console.log(`📊 Data Quality: ${(questionsData.insights.dataQuality * 100).toFixed(0)}%`);
    console.log(`❓ Questions: ${questionsData.questions.length}`);
    console.log(`🏢 Business: ${questionsData.insights.businessName}`);
    console.log('\nQuestions:');
    
    questionsData.questions.forEach((q, idx) => {
      console.log(`\n${idx + 1}. ${q.question}`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Category: ${q.category || 'general'}`);
      if (q.options) {
        console.log(`   Options: ${q.options.length}`);
      }
    });

    console.log('\n✅ Test completed successfully!');
    console.log('\nAPI is ready for integration:');
    console.log('- Question generation works');
    console.log('- Data quality assessment works');
    console.log('- Business data is properly extracted');
    console.log(`- ${questionsData.questions.length} intelligent questions generated`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testEnhancedAPI().catch(console.error);