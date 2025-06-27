/**
 * Debug: Check what Google Places API returns
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const placeId = process.argv[2] || 'ChIJB4JQbuvFQIYRLu_R3msXkTM';

async function checkPlacesData() {
  console.log('🔍 Fetching raw Places API data...\n');
  
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,types,rating,user_ratings_total,reviews,photos,opening_hours,price_level,editorial_summary',
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );
    
    const place = response.data.result;
    
    console.log('📊 Raw API Response:');
    console.log(JSON.stringify(place, null, 2));
    
    console.log('\n📋 Key Fields:');
    console.log('- Name:', place.name);
    console.log('- Types:', place.types);
    console.log('- Rating:', place.rating, '⭐');
    console.log('- Total Reviews:', place.user_ratings_total);
    console.log('- Reviews Array:', place.reviews?.length || 0, 'reviews');
    console.log('- Photos:', place.photos?.length || 0, 'photos');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('API Response:', error.response.data);
    }
  }
}

checkPlacesData();
