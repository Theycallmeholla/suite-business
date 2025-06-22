import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const API_KEY = process.env.GHL_PRIVATE_INTEGRATIONS_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID;

async function testSaaSMode() {
  console.log('Testing GoHighLevel SaaS Mode API...\n');
  
  if (!API_KEY) {
    console.error('❌ GHL_PRIVATE_INTEGRATIONS_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ Private Integration Key found:', API_KEY.substring(0, 20) + '...');
  
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
  
  try {
    // Test 1: Check if we can list locations (agency level access)
    console.log('\n🔍 Test 1: Checking agency-level access...');
    try {
      const response = await axios.get(
        `${GHL_API_BASE}/locations?limit=1`,
        { headers }
      );
      console.log('✅ Can list locations - Agency level access confirmed');
      console.log(`   Found ${response.data.locations?.length || 0} locations`);
    } catch (err: any) {
      console.error('❌ Cannot list locations:', err.response?.data || err.message);
      console.error('   This might mean the key only has location-level access');
    }
    
    // Test 2: Try creating a test sub-account
    console.log('\n🔍 Test 2: Testing sub-account creation...');
    const companyId = process.env.GHL_AGENCY_ID;
    
    if (!companyId) {
      console.error('❌ GHL_AGENCY_ID not found in environment variables');
      return;
    }
    
    console.log('🏢 Company ID:', companyId);
    
    const testLocationData = {
      companyId: companyId,
      name: 'Test Business - DELETE ME',
      email: 'test@example.com',
      phone: '+15555551234',
      address: '123 Test St, Test City, TX 77001',
      website: 'https://test.example.com'
    };
    
    try {
      console.log('📝 Attempting to create location with data:', JSON.stringify(testLocationData, null, 2));
      
      const createResponse = await axios.post(
        `${GHL_API_BASE}/locations/`,
        testLocationData,
        { headers }
      );
      
      console.log('✅ Location created successfully!');
      console.log('   Full response:', JSON.stringify(createResponse.data, null, 2));
      
      // Try different response structures
      const locationId = createResponse.data.location?.id || 
                        createResponse.data.id || 
                        createResponse.data.locationId;
      const locationName = createResponse.data.location?.name || 
                          createResponse.data.name || 
                          createResponse.data.companyName;
                          
      console.log('   Location ID:', locationId);
      console.log('   Location Name:', locationName);
      
      // Clean up - delete the test location
      if (locationId) {
        console.log('\n🧹 Cleaning up test location...');
        try {
          await axios.delete(
            `${GHL_API_BASE}/locations/${locationId}`,
            { headers }
          );
          console.log('✅ Test location deleted');
        } catch (cleanupErr: any) {
          console.error('⚠️  Could not delete test location:', cleanupErr.response?.status);
          console.error('   Error:', cleanupErr.response?.data || cleanupErr.message);
        }
      }
      
    } catch (createErr: any) {
      console.error('❌ Cannot create location:', createErr.response?.status);
      console.error('   Error details:', JSON.stringify(createErr.response?.data, null, 2));
      
      if (createErr.response?.status === 403) {
        console.error('\n🚨 Permission Error - Possible causes:');
        console.error('1. The Private Integration key doesn\'t have location creation permissions');
        console.error('2. You need to enable specific scopes in your Private Integration');
        console.error('3. Your account plan doesn\'t support SaaS mode');
      }
    }
    
  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

// Run the test
testSaaSMode();
