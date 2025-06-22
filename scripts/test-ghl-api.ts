import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
// Use Private Integration key for API v2
const API_KEY = process.env.GHL_PRIVATE_INTEGRATIONS_KEY || process.env.GHL_API_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID;

async function testGHLConnection() {
  console.log('Testing GoHighLevel API connection...\n');
  
  // Check if API key is present
  if (!API_KEY) {
    console.error('❌ GHL_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ API Key found:', API_KEY.substring(0, 20) + '...');
  console.log('📍 Location ID:', LOCATION_ID);
  
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
  
  try {
    // Test 1: Get current location info
    console.log('\n🔍 Test 1: Fetching location info...');
    const locationResponse = await axios.get(
      `${GHL_API_BASE}/locations/${LOCATION_ID}`,
      { headers }
    );
    console.log('✅ Location fetched successfully:', locationResponse.data.location?.name);
    
    // Test 2: Check API access level
    console.log('\n🔍 Test 2: Checking API permissions...');
    const userResponse = await axios.get(
      `${GHL_API_BASE}/users/me`,
      { headers }
    );
    console.log('✅ API User:', userResponse.data.email);
    console.log('📋 Permissions:', userResponse.data.permissions);
    
    // Test 3: Try to list locations (agency level)
    console.log('\n🔍 Test 3: Listing locations...');
    const locationsResponse = await axios.get(
      `${GHL_API_BASE}/locations`,
      { headers }
    );
    console.log('✅ Can access locations:', locationsResponse.data.locations?.length || 0, 'locations found');
    
  } catch (error: any) {
    console.error('\n❌ API Test Failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('\n🚨 Authentication Error - Possible causes:');
      console.error('1. API key is invalid or expired');
      console.error('2. API key doesn\'t have sufficient permissions');
      console.error('3. Wrong API endpoint or version');
    }
  }
}

// Run the test
testGHLConnection();
