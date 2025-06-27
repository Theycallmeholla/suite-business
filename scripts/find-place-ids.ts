/**
 * Helper Script: Find Google Place IDs for Testing
 * 
 * This script helps you find Place IDs for local businesses to test with
 * 
 * Usage:
 * npx tsx scripts/find-place-ids.ts "business name" "location"
 * 
 * Example:
 * npx tsx scripts/find-place-ids.ts "landscaping" "Houston"
 * npx tsx scripts/find-place-ids.ts "Joe's Plumbing" "Houston TX"
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get search query from command line
const args = process.argv.slice(2);
const searchQuery = args.join(' ');

if (!searchQuery) {
  console.log('❌ Please provide a search query');
  console.log('Usage: npx tsx scripts/find-place-ids.ts "business name" "location"');
  console.log('Example: npx tsx scripts/find-place-ids.ts "landscaping" "Houston"');
  process.exit(1);
}

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error('❌ Please set GOOGLE_MAPS_API_KEY in your .env file');
  process.exit(1);
}

/**
 * Search for places using Google Places Text Search
 */
async function searchPlaces(query: string) {
  try {
    console.log(`🔍 Searching for: "${query}"\n`);
    
    // Use Text Search for more flexible results
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query: query,
          key: process.env.GOOGLE_MAPS_API_KEY,
          // Optional: limit to a specific location
          // location: '29.7604,-95.3698', // Houston coordinates
          // radius: 50000 // 50km radius
        }
      }
    );
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${response.data.status}`);
    }
    
    const results = response.data.results || [];
    
    if (results.length === 0) {
      console.log('No results found. Try a different search query.');
      return;
    }
    
    console.log(`Found ${results.length} results:\n`);
    console.log('━'.repeat(80));
    
    // Display results
    results.slice(0, 10).forEach((place: any, index: number) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   📍 ${place.formatted_address}`);
      console.log(`   🆔 Place ID: ${place.place_id}`);
      console.log(`   📊 Rating: ${place.rating ? `${place.rating} ⭐ (${place.user_ratings_total} reviews)` : 'No ratings'}`);
      console.log(`   🏷️  Types: ${place.types.slice(0, 3).join(', ')}`);
      console.log(`   💰 Price Level: ${place.price_level ? '$'.repeat(place.price_level) : 'Not specified'}`);
      console.log('');
    });
    
    console.log('━'.repeat(80));
    console.log('\n📝 How to use these Place IDs:\n');
    console.log('1. Copy a Place ID from above');
    console.log('2. Run the test script:');
    console.log('   npx tsx scripts/test-real-places-data.ts [PLACE_ID]');
    console.log('\nExample:');
    console.log(`   npx tsx scripts/test-real-places-data.ts ${results[0].place_id}`);
    
    // Also fetch details for the first result to show what data is available
    if (results.length > 0) {
      console.log('\n🔍 Fetching detailed data for the first result...\n');
      await fetchPlaceDetails(results[0].place_id, results[0].name);
    }
    
  } catch (error: any) {
    console.error('❌ Search failed:', error.message);
    
    if (error.response?.data?.error_message) {
      console.error('API Error:', error.response.data.error_message);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check that your API key is valid');
    console.log('2. Ensure Places API is enabled in Google Cloud Console');
    console.log('3. Try a more specific search query');
  }
}

/**
 * Fetch detailed information about a place
 */
async function fetchPlaceDetails(placeId: string, name: string) {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,types,rating,user_ratings_total,photos,opening_hours,editorial_summary',
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );
    
    if (response.data.status !== 'OK') {
      throw new Error(`Places API error: ${response.data.status}`);
    }
    
    const place = response.data.result;
    
    console.log(`📊 Detailed Data Available for "${name}":`);
    console.log('━'.repeat(50));
    console.log(`✅ Business Name: ${place.name}`);
    console.log(`✅ Phone: ${place.formatted_phone_number || 'Not provided'}`);
    console.log(`✅ Website: ${place.website || 'Not provided'}`);
    console.log(`✅ Photos: ${place.photos?.length || 0} available`);
    console.log(`✅ Hours: ${place.opening_hours ? 'Available' : 'Not provided'}`);
    console.log(`✅ Description: ${place.editorial_summary?.overview ? 'Available' : 'Not provided'}`);
    console.log('━'.repeat(50));
    
    console.log('\n✨ This business has enough data for testing!');
    console.log(`\n🚀 Test it now:\n   npx tsx scripts/test-real-places-data.ts ${placeId}`);
    
  } catch (error: any) {
    console.error('Could not fetch details:', error.message);
  }
}

/**
 * Show industry-specific search suggestions
 */
function showSearchSuggestions() {
  console.log('\n💡 Search Suggestions by Industry:\n');
  
  const suggestions = {
    'Landscaping': [
      '"landscaping services Houston"',
      '"lawn care near Houston TX"',
      '"Joe\'s Landscaping Houston"'
    ],
    'HVAC': [
      '"HVAC repair Houston"',
      '"air conditioning Houston TX"',
      '"heating and cooling near me Houston"'
    ],
    'Plumbing': [
      '"plumber Houston"',
      '"emergency plumbing Houston TX"',
      '"drain cleaning service Houston"'
    ],
    'Cleaning': [
      '"house cleaning Houston"',
      '"commercial cleaning services Houston TX"',
      '"maid service near me Houston"'
    ],
    'Roofing': [
      '"roofing contractor Houston"',
      '"roof repair Houston TX"',
      '"roofing company near me Houston"'
    ],
    'Electrical': [
      '"electrician Houston"',
      '"electrical contractor Houston TX"',
      '"emergency electrician near me Houston"'
    ]
  };
  
  Object.entries(suggestions).forEach(([industry, queries]) => {
    console.log(`${industry}:`);
    queries.forEach(q => console.log(`  npx tsx scripts/find-place-ids.ts ${q}`));
    console.log('');
  });
}

// Show help if requested
if (searchQuery === '--help' || searchQuery === '-h') {
  console.log('Find Google Place IDs for Testing\n');
  console.log('Usage:');
  console.log('  npx tsx scripts/find-place-ids.ts "search query"');
  console.log('\nExamples:');
  console.log('  npx tsx scripts/find-place-ids.ts "landscaping Houston"');
  console.log('  npx tsx scripts/find-place-ids.ts "Joe\'s Plumbing Houston TX"');
  console.log('  npx tsx scripts/find-place-ids.ts "HVAC repair near Houston Texas"');
  
  showSearchSuggestions();
  process.exit(0);
}

// Run the search
searchPlaces(searchQuery);
