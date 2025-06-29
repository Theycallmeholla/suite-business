/**
 * GBP Field Migration Guide - CRITICAL FIX
 * 
 * The GBP API response structure has changed or we've been using wrong paths.
 * This file shows the CORRECT field paths to use.
 */

// ❌ OLD/WRONG Field Paths (causing false "missing data" reports)
const WRONG_PATHS = {
  phone: 'locationData.phoneNumbers?.primaryPhone',
  website: 'locationData.websiteUri',
  address: 'locationData.storefrontAddress',
  hours: 'locationData.regularHours?.weekdayDescriptions',
  categories: 'locationData.categories?.additionalCategories',
  description: 'locationData.locationDescription',
  serviceArea: 'locationData.serviceAreas',
  establishedDate: 'locationData.openingDate'
};

// ✅ CORRECT Field Paths (what actually exists in the response)
const CORRECT_PATHS = {
  phone: 'locationData.primaryPhone',
  website: 'locationData.website',
  address: 'locationData.address || locationData.fullAddress',
  hours: 'locationData.regularHours?.periods',
  categories: 'locationData.additionalCategories',
  description: 'locationData.profile?.description',
  serviceArea: 'locationData.serviceArea?.places?.placeInfos',
  establishedDate: 'locationData.metadata?.establishedDate'
};

// ✅ CORRECT calculateDataRichness() function
export function calculateDataRichness(locationData) {
  let score = 0;
  
  // Core fields (15 points each)
  if (locationData.primaryPhone) score += 15;
  if (locationData.regularHours?.periods?.length > 0) score += 15;
  if (locationData.address || locationData.fullAddress) score += 15;
  
  // Important fields (10 points each)
  if (locationData.website) score += 10;
  if (locationData.serviceArea?.places?.placeInfos?.length > 0) score += 10;
  if (locationData.profile?.description?.length > 100) score += 10;
  if (locationData.additionalCategories?.length > 0) score += 10;
  
  // Years in business (15 points) - check both metadata and description
  const hasYearsInBiz = !!locationData.metadata?.establishedDate ||
    /since \d{4}/i.test(locationData.profile?.description || '');
  if (hasYearsInBiz) score += 15;
  
  return score;
}

// ✅ CORRECT field checks for JSX
export const FieldChecks = {
  hasPhone: (data) => !!data.primaryPhone,
  hasWebsite: (data) => !!data.website,
  hasAddress: (data) => !!(data.address || data.fullAddress),
  hasHours: (data) => !!(data.regularHours?.periods?.length > 0),
  hasServiceArea: (data) => !!(data.serviceArea?.places?.placeInfos?.length > 0),
  hasDescription: (data) => !!(data.profile?.description?.length > 100),
  hasCategories: (data) => !!(data.additionalCategories?.length > 0),
  hasYearsInBusiness: (data) => {
    return !!data.metadata?.establishedDate ||
      /since \d{4}/i.test(data.profile?.description || '');
  }
};

// Example JSX updates needed:
/*
// ❌ WRONG:
{locationData.phoneNumbers?.primaryPhone ? '✅ Available' : '❌ Missing'}

// ✅ CORRECT:
{locationData.primaryPhone ? '✅ Available' : '❌ Missing'}

// ❌ WRONG:
{locationData.websiteUri ? '✅ Available' : '❌ Missing'}

// ✅ CORRECT:
{locationData.website ? '✅ Available' : '❌ Missing'}

// ❌ WRONG:
{locationData.storefrontAddress ? '✅ Available' : '❌ Missing'}

// ✅ CORRECT:
{(locationData.address || locationData.fullAddress) ? '✅ Available' : '❌ Missing'}
*/

// Test location to verify fixes:
export const TEST_LOCATION = 'locations/2315391108903134470';

// Expected results after fix:
export const EXPECTED_RESULTS = {
  phone: '✅ Available',
  website: '✅ Available', 
  address: '⚡ Service area only', // This is expected for this location
  yearsInBusiness: '✅ Available', // Should detect from description
  suppressionWorking: '✅ Yes'
};
