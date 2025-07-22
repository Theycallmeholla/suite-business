import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '@/lib/logger';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
// Use Private Integration key for API v2
const API_KEY = process.env.GHL_PRIVATE_INTEGRATIONS_KEY || process.env.GHL_API_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID;

async function testGHLConnection() {
  logger.info('Testing GoHighLevel API connection...\n');
  
  // Check if API key is present
  if (!API_KEY) {
    logger.error('❌ GHL_API_KEY not found in environment variables');
    return;
  }
  
  logger.info('✅ API Key found:', API_KEY.substring(0, 20) + '...');
  logger.info('📍 Location ID:', LOCATION_ID);
  
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
  
  try {
    // Test 1: Get current location info
    logger.info('\n🔍 Test 1: Fetching location info...');
    const locationResponse = await axios.get(
      `${GHL_API_BASE}/locations/${LOCATION_ID}`,
      { headers }
    );
    logger.info('✅ Location fetched successfully:', locationResponse.data.location?.name);
    
    // Test 2: Check API access level
    logger.info('\n🔍 Test 2: Checking API permissions...');
    const userResponse = await axios.get(
      `${GHL_API_BASE}/users/me`,
      { headers }
    );
    logger.info('✅ API User:', userResponse.data.email);
    logger.info('📋 Permissions:', userResponse.data.permissions);
    
    // Test 3: Try to list locations (agency level)
    logger.info('\n🔍 Test 3: Listing locations...');
    const locationsResponse = await axios.get(
      `${GHL_API_BASE}/locations`,
      { headers }
    );
    logger.info('✅ Can access locations:', locationsResponse.data.locations?.length || 0, 'locations found');
    
  } catch (_error: unknown) {
    logger.error('\n❌ API Test Failed:');
    logger.error('Status:', error.response?.status);
    logger.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      logger.error('\n🚨 Authentication Error - Possible causes:');
      logger.error('1. API key is invalid or expired');
      logger.error('2. API key doesn\'t have sufficient permissions');
      logger.error('3. Wrong API endpoint or version');
    }
  }
}

// Run the test
testGHLConnection();
