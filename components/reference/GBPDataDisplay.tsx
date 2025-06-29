import React from 'react';

/**
 * REFERENCE COMPONENT - Shows CORRECT way to read GBP fields
 * Copy these patterns to fix the field misread issues
 */

// ✅ CORRECT field checks
const GBPDataDisplay = ({ locationData }) => {
  // Calculate data richness the CORRECT way
  const calculateDataRichness = (data) => {
    let score = 0;
    
    if (data.primaryPhone) score += 15;
    if (data.regularHours?.periods?.length > 0) score += 15;
    if (data.website) score += 10;
    if (data.address || data.fullAddress) score += 15;
    if (data.serviceArea?.places?.placeInfos?.length > 0) score += 10;
    if (data.metadata?.establishedDate || /since \d{4}/i.test(data.profile?.description || '')) score += 15;
    if (data.profile?.description?.length > 100) score += 10;
    if (data.additionalCategories?.length > 0) score += 10;
    
    return score;
  };

  // Helper functions for field checks
  const hasPhone = () => !!locationData.primaryPhone;
  const hasWebsite = () => !!locationData.website;
  const hasAddress = () => !!(locationData.address || locationData.fullAddress);
  const hasHours = () => !!(locationData.regularHours?.periods?.length > 0);
  const hasServiceArea = () => !!(locationData.serviceArea?.places?.placeInfos?.length > 0);
  const hasDescription = () => !!(locationData.profile?.description?.length > 100);
  const hasCategories = () => !!(locationData.additionalCategories?.length > 0);
  const hasYearsInBusiness = () => {
    return !!locationData.metadata?.establishedDate ||
      /since \d{4}/i.test(locationData.profile?.description || '');
  };

  const dataScore = calculateDataRichness(locationData);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">GBP Data Status</h2>
      
      {/* Data Richness Score */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">Data Richness Score: {dataScore}/100</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${dataScore}%` }}
          />
        </div>
      </div>

      {/* Field Status List */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Phone Number:</span>
          <span>{hasPhone() ? '✅ Available' : '❌ Missing'}</span>
          {hasPhone() && (
            <span className="text-sm text-gray-600">({locationData.primaryPhone})</span>
          )}
        </div>

        <div className="flex justify-between">
          <span>Website:</span>
          <span>{hasWebsite() ? '✅ Available' : '❌ Missing'}</span>
          {hasWebsite() && (
            <span className="text-sm text-gray-600">({locationData.website})</span>
          )}
        </div>

        <div className="flex justify-between">
          <span>Address:</span>
          <span>
            {hasAddress() 
              ? '✅ Available' 
              : hasServiceArea() 
                ? '⚡ Service area only' 
                : '❌ Missing'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Business Hours:</span>
          <span>{hasHours() ? '✅ Available' : '❌ Missing'}</span>
          {hasHours() && (
            <span className="text-sm text-gray-600">
              ({locationData.regularHours.periods.length} periods)
            </span>
          )}
        </div>

        <div className="flex justify-between">
          <span>Service Area:</span>
          <span>{hasServiceArea() ? '✅ Available' : '❌ Missing'}</span>
          {hasServiceArea() && (
            <span className="text-sm text-gray-600">
              ({locationData.serviceArea.places.placeInfos.length} areas)
            </span>
          )}
        </div>

        <div className="flex justify-between">
          <span>Description:</span>
          <span>{hasDescription() ? '✅ Available' : '❌ Missing'}</span>
          {hasDescription() && (
            <span className="text-sm text-gray-600">
              ({locationData.profile.description.length} chars)
            </span>
          )}
        </div>

        <div className="flex justify-between">
          <span>Years in Business:</span>
          <span>{hasYearsInBusiness() ? '✅ Available' : '❌ Missing'}</span>
        </div>

        <div className="flex justify-between">
          <span>Additional Categories:</span>
          <span>{hasCategories() ? '✅ Available' : '❌ Missing'}</span>
          {hasCategories() && (
            <span className="text-sm text-gray-600">
              ({locationData.additionalCategories.length} categories)
            </span>
          )}
        </div>
      </div>

      {/* Raw Data Preview (for debugging) */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600">
          View Raw Data Structure
        </summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify({
            primaryPhone: locationData.primaryPhone,
            website: locationData.website,
            address: locationData.address,
            fullAddress: locationData.fullAddress,
            'regularHours.periods': locationData.regularHours?.periods,
            'serviceArea.places.placeInfos': locationData.serviceArea?.places?.placeInfos,
            'profile.description': locationData.profile?.description?.substring(0, 100),
            additionalCategories: locationData.additionalCategories,
            'metadata.establishedDate': locationData.metadata?.establishedDate
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default GBPDataDisplay;

// ❌ WRONG WAY (what to search for and replace)
/*
const WrongFieldChecks = {
  phone: locationData.phoneNumbers?.primaryPhone,
  website: locationData.websiteUri,
  address: locationData.storefrontAddress,
  hours: locationData.regularHours?.weekdayDescriptions,
  serviceArea: locationData.serviceAreas,
  description: locationData.locationDescription,
  categories: locationData.categories?.additionalCategories
};
*/

// ✅ CORRECT WAY (what to replace it with)
/*
const CorrectFieldChecks = {
  phone: locationData.primaryPhone,
  website: locationData.website,
  address: locationData.address || locationData.fullAddress,
  hours: locationData.regularHours?.periods,
  serviceArea: locationData.serviceArea?.places?.placeInfos,
  description: locationData.profile?.description,
  categories: locationData.additionalCategories
};
*/
