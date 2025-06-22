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
  if (!regularHours?.periods) return null;
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hoursMap: Record<string, string> = {};
  
  regularHours.periods.forEach((period: any) => {
    if (period.openDay !== undefined && period.openTime && period.closeTime) {
      const day = daysOfWeek[period.openDay];
      const openTime = formatTime(period.openTime);
      const closeTime = formatTime(period.closeTime);
      if (day && openTime && closeTime) {
        hoursMap[day] = `${openTime} - ${closeTime}`;
      }
    }
  });
  
  return hoursMap;
};

const formatTime = (time: any) => {
  if (!time) return '';
  
  // Handle both string format (HHMM) and object format ({hours: 8, minutes: 0})
  if (typeof time === 'string') {
    const hour = parseInt(time.substring(0, 2));
    const minute = time.substring(2, 4);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute} ${ampm}`;
  } else if (time.hours !== undefined) {
    const hour = time.hours;
    const minute = time.minutes || 0;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
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
  console.log('🔧 Services:', business.serviceItems);
  console.log('📝 Profile:', business.profile);
  console.log('🏷️ Labels:', business.labels);
  console.log('📊 Metadata:', business.metadata);
  
  const detectedIndustry = detectIndustry(business.primaryCategory);
  const formattedHours = formatHours(business.regularHours);
  const suggestedSubdomain = generateSubdomain(business.name);
  
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
      {formattedHours && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Business Hours
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(formattedHours).map(([day, hours]) => (
              <div key={day}>
                <span className="font-medium">{day}:</span> {hours}
              </div>
            ))}
          </div>
          {business.openInfo?.status && (
            <p className="mt-3 text-sm">
              Currently: <span className={`font-medium ${
                business.openInfo.status === 'OPEN' ? 'text-green-600' : 'text-red-600'
              }`}>
                {business.openInfo.status}
              </span>
            </p>
          )}
        </Card>
      )}

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
          <span className="text-sm font-mono">
            {suggestedSubdomain}.{window.location.hostname}
          </span>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleConfirm}
          className="flex-1"
          size="lg"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Continue to Industry Selection
        </Button>
        <Button
          onClick={onEdit}
          variant="outline"
          size="lg"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Let me fix something
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