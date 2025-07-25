'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Building2, Globe, Phone, MapPin, Clock, CheckCircle2, 
  Edit2, Briefcase, Calendar, Star, Truck,
  AlertCircle, Hash, Languages, ChevronDown, ChevronUp, Code
} from 'lucide-react';

interface BusinessConfirmationProps {
  business: any; // Full business data from GBP
  selectedAccountId?: string;
  onConfirm: (detectedIndustry?: string) => void;
  onEdit: () => void;
}

// Generate subdomain from business name
const generateSubdomain = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30);
};

// Detect industry from category
const detectIndustry = (category: any) => {
  if (!category?.displayName) return null;
  const categoryName = category.displayName.toLowerCase();
  
  if (categoryName.includes('landscap') || categoryName.includes('lawn')) return { value: 'landscaping', label: 'Landscaping & Lawn Care' };
  if (categoryName.includes('hvac') || categoryName.includes('heating') || categoryName.includes('cooling')) return { value: 'hvac', label: 'HVAC (Heating & Cooling)' };
  if (categoryName.includes('plumb')) return { value: 'plumbing', label: 'Plumbing' };
  if (categoryName.includes('clean')) return { value: 'cleaning', label: 'Cleaning Services' };
  if (categoryName.includes('roof')) return { value: 'roofing', label: 'Roofing' };
  if (categoryName.includes('electric')) return { value: 'electrical', label: 'Electrical' };
  
  return null;
};

// Format operating hours
const formatHours = (regularHours: any) => {
  console.log('🕐 formatHours input:', regularHours);
  
  if (!regularHours?.periods) {
    console.log('❌ No periods found in regularHours');
    return null;
  }
  
  console.log('✅ Found periods:', regularHours.periods.length);
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayMapping: Record<string, string> = {
    'SUNDAY': 'Sunday',
    'MONDAY': 'Monday',
    'TUESDAY': 'Tuesday',
    'WEDNESDAY': 'Wednesday',
    'THURSDAY': 'Thursday',
    'FRIDAY': 'Friday',
    'SATURDAY': 'Saturday'
  };
  const hoursMap: Record<string, string> = {};
  
  regularHours.periods.forEach((period: any, index: number) => {
    console.log(`📅 Period ${index}:`, period);
    if (period.openDay && period.openTime && period.closeTime) {
      // Handle both string day names and numeric indices
      const day = typeof period.openDay === 'string' 
        ? dayMapping[period.openDay] 
        : daysOfWeek[period.openDay];
      
      if (day) {
        const openTime = formatTime(period.openTime);
        const closeTime = formatTime(period.closeTime);
        if (openTime && closeTime) {
          hoursMap[day] = `${openTime} - ${closeTime}`;
        }
      }
    }
  });
  
  // Sort days in correct order
  const sortedHours: Record<string, string> = {};
  daysOfWeek.forEach(day => {
    if (hoursMap[day]) {
      sortedHours[day] = hoursMap[day];
    }
  });
  
  return Object.keys(sortedHours).length > 0 ? sortedHours : null;
};

const formatTime = (time: any) => {
  if (!time) return '';
  
  // Handle both string format (HHMM) and object format ({hours: 8, minutes: 0})
  if (typeof time === 'string') {
    const hour = parseInt(time.substring(0, 2));
    const minute = time.substring(2, 4);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    // Only show minutes if they're not :00
    return minute === '00' ? `${displayHour}${ampm}` : `${displayHour}:${minute}${ampm}`;
  } else if (time.hours !== undefined) {
    const hour = time.hours;
    const minute = time.minutes || 0;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    // Only show minutes if they're not :00
    return minute === 0 ? `${displayHour}${ampm}` : `${displayHour}:${minute.toString().padStart(2, '0')}${ampm}`;
  }
  
  return '';
};

export function BusinessConfirmation({ business, selectedAccountId, onConfirm, onEdit }: BusinessConfirmationProps) {
  const { data: session } = useSession();
  const [showRawData, setShowRawData] = useState(false);
  
  // Log all the business data to console
  console.log('🎯 FULL BUSINESS DATA FROM GOOGLE:', business);
  console.log('📱 Primary Phone:', business.primaryPhone);
  console.log('📍 Service Area:', business.serviceArea);
  console.log('🏷️ Categories:', business.primaryCategory, business.additionalCategories);
  console.log('⏰ Hours:', business.regularHours);
  console.log('⏰ Hours Structure:', {
    hasRegularHours: !!business.regularHours,
    hasPeriods: !!business.regularHours?.periods,
    periodsLength: business.regularHours?.periods?.length,
    firstPeriod: business.regularHours?.periods?.[0],
    allPeriods: business.regularHours?.periods
  });
  console.log('🔧 Services:', business.serviceItems);
  console.log('📝 Profile:', business.profile);
  console.log('🏷️ Labels:', business.labels);
  console.log('📊 Metadata:', business.metadata);
  
  const detectedIndustry = detectIndustry(business.primaryCategory);
  const formattedHours = formatHours(business.regularHours);
  const suggestedSubdomain = generateSubdomain(business.name);
  
  // Check if we have any hours data at all
  const hasAnyHoursData = !!(business.regularHours || business.openInfo || business.moreHours?.length > 0);
  
  // Generate the full URL based on environment
  const getWebsiteUrl = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${suggestedSubdomain}.${host}`;
  };
  
  const websiteUrl = getWebsiteUrl();
  const isLocalDev = window.location.hostname === 'localhost';
  
  const handleConfirm = () => {
    // Pass the detected industry to the parent
    onConfirm(detectedIndustry?.value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          ✨ We found your business on Google!
        </h2>
        <p className="text-gray-600">
          Review the information below and confirm to continue
        </p>
      </div>

      {/* Business Overview */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">{business.name}</h3>
                {business.storeCode && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Hash className="h-3 w-3 mr-1" />
                    Store Code: {business.storeCode}
                  </p>
                )}
              </div>
            </div>
            {business.languageCode && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center">
                <Languages className="h-3 w-3 mr-1" />
                {business.languageCode.toUpperCase()}
              </span>
            )}
          </div>

          {/* Industry Detection */}
          {detectedIndustry && (
            <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                <strong>Industry Detected:</strong> {detectedIndustry.label}
              </span>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {business.primaryPhone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{business.primaryPhone}</span>
                {business.additionalPhones?.length > 0 && (
                  <span className="text-xs text-gray-500">
                    +{business.additionalPhones.length} more
                  </span>
                )}
              </div>
            )}
            
            {business.website && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <a 
                  href={business.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  {business.website}
                </a>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="text-sm">
              {business.address !== 'Address not available' ? (
                <p>{business.address}</p>
              ) : business.serviceArea?.businessType === 'CUSTOMER_LOCATION_ONLY' ? (
                <p className="text-gray-600 italic">Service area business (no storefront)</p>
              ) : (
                <p>{business.address}</p>
              )}
              
              {/* Service Area Details */}
              {business.serviceArea?.places?.placeInfos && (
                <div className="mt-2">
                  <p className="text-gray-700 font-medium flex items-center mb-1">
                    <Truck className="h-3 w-3 mr-1" />
                    We serve {business.serviceArea.places.placeInfos.length} areas:
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {business.serviceArea.places.placeInfos.map((place: any, index: number) => (
                      <span key={index} className="text-xs text-gray-600">
                        • {place.placeName.split(',')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Operating Hours */}
      {formattedHours ? (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Business Hours
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
              const hours = formattedHours[day];
              const dayAbbrev = day.substring(0, 3).toUpperCase();
              
              if (!hours) {
                return (
                  <div key={day} className="text-center">
                    <div className="text-xs font-semibold text-gray-500 mb-1">{dayAbbrev}</div>
                    <div className="border rounded-lg p-3 bg-gray-50 min-h-[80px] flex items-center justify-center">
                      <span className="text-xs text-gray-400">Closed</span>
                    </div>
                  </div>
                );
              }
              
              const [openTime, closeTime] = hours.split(' - ');
              
              return (
                <div key={day} className="text-center">
                  <div className="text-xs font-semibold text-gray-700 mb-1">{dayAbbrev}</div>
                  <div className="border border-green-200 rounded-lg p-2 bg-green-50 min-h-[80px] flex flex-col justify-between">
                    <div className="text-xs font-medium text-green-700">{openTime}</div>
                    <div className="text-[10px] text-gray-500 my-1">to</div>
                    <div className="text-xs font-medium text-green-700">{closeTime}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {business.openInfo?.status && (
            <p className="mt-4 text-sm text-center">
              Currently: <span className={`font-medium ${
                business.openInfo.status === 'OPEN' ? 'text-green-600' : 'text-red-600'
              }`}>
                {business.openInfo.status}
              </span>
            </p>
          )}
        </Card>
      ) : hasAnyHoursData ? (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Business Hours
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Hours information is being loaded</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Your business hours are available but couldn't be displayed in the expected format. 
                  They will be imported correctly when your website is created.
                </p>
                {business.openInfo?.status && (
                  <p className="text-sm mt-2">
                    Currently: <span className={`font-medium ${
                      business.openInfo.status === 'OPEN' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {business.openInfo.status}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Services - Extract from Categories */}
      {(business.primaryCategory?.serviceTypes || business.additionalCategories?.some((cat: any) => cat.serviceTypes)) && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Services We Detected ({
              (business.primaryCategory?.serviceTypes?.length || 0) +
              (business.additionalCategories?.reduce((acc: number, cat: any) => acc + (cat.serviceTypes?.length || 0), 0) || 0)
            } Total!)
          </h3>
          
          {/* Primary Category Services */}
          {business.primaryCategory?.serviceTypes && (
            <div className="mb-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                {business.primaryCategory.displayName} Services:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {business.primaryCategory.serviceTypes.slice(0, 12).map((service: any, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs">{service.displayName}</span>
                  </div>
                ))}
                {business.primaryCategory.serviceTypes.length > 12 && (
                  <span className="text-xs text-gray-500 italic">
                    +{business.primaryCategory.serviceTypes.length - 12} more...
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Additional Categories Services */}
          {business.additionalCategories?.map((category: any, catIndex: number) => (
            category.serviceTypes && (
              <div key={catIndex} className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {category.displayName} Services:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {category.serviceTypes.slice(0, 6).map((service: any, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{service.displayName}</span>
                    </div>
                  ))}
                  {category.serviceTypes.length > 6 && (
                    <span className="text-xs text-gray-500 italic">
                      +{category.serviceTypes.length - 6} more...
                    </span>
                  )}
                </div>
              </div>
            )
          ))}
        </Card>
      )}

      {/* Business Description */}
      {business.profile?.description && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">About Your Business</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {business.profile.description}
          </p>
        </Card>
      )}

      {/* Categories */}
      {(business.primaryCategory || business.additionalCategories?.length > 0) && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Business Categories</h3>
          <div className="flex flex-wrap gap-2">
            {business.primaryCategory && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                <Star className="h-3 w-3 mr-1" />
                {business.primaryCategory.displayName}
              </span>
            )}
            {business.additionalCategories?.map((cat: any, index: number) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {cat.displayName}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Special Features */}
      {(business.moreHours?.length > 0 || business.labels?.length > 0) && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Special Features</h3>
          <div className="space-y-2">
            {business.moreHours?.map((hours: any, index: number) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{hours.hoursTypeId}: Available</span>
              </div>
            ))}
            {business.labels?.map((label: string, index: number) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Website Preview */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-3">Your New Website</h3>
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-mono text-blue-600">
            {websiteUrl}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {isLocalDev 
            ? 'Local development URL - in production this will be your custom domain'
            : 'This will be your website URL once published'
          }
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Button
          onClick={handleConfirm}
          size="lg"
          className="min-w-[300px]"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Continue to Industry Selection
        </Button>
      </div>

      {/* Debug: Raw Data Viewer */}
      <Card className="mt-6 p-4 bg-gray-900 text-gray-100">
        <Button
          onClick={() => setShowRawData(!showRawData)}
          variant="ghost"
          size="sm"
          className="w-full justify-between text-gray-300 hover:text-white"
        >
          <span className="flex items-center">
            <Code className="h-4 w-4 mr-2" />
            View Raw API Data (Developer)
          </span>
          {showRawData ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showRawData && (
          <div className="mt-4 overflow-auto max-h-96">
            <pre className="text-xs">
              {JSON.stringify(business, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}