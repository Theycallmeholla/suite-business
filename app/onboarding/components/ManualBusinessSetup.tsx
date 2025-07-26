'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Building2, Clock, MapPin, Phone, Globe, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';

interface ManualBusinessSetupProps {
  initialData?: {
    businessName: string;
    address: string;
    placeId?: string;
    primaryPhone?: string | null;
    website?: string | null;
    coordinates?: any;
    regularHours?: any;
    primaryCategory?: any;
    profile?: any;
  };
  onComplete: (data: any) => void;
  onBack: () => void;
  onUpdate?: (data: any) => void;
}

const INDUSTRIES = [
  { value: 'landscaping', label: 'Landscaping & Lawn Care' },
  { value: 'hvac', label: 'HVAC (Heating & Cooling)' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'general', label: 'Other Service Business' },
];

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

// Generate subdomain from business name
const generateSubdomain = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30);
};

interface BusinessHours {
  [key: string]: {
    open: boolean;
    openTime: string;
    closeTime: string;
  };
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function ManualBusinessSetup({ initialData, onComplete, onBack, onUpdate }: ManualBusinessSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'basic' | 'hours' | 'services'>('basic');
  
  // Parse address if we have initial data
  const parseAddress = (fullAddress?: string) => {
    if (!fullAddress) return { address: '', city: '', state: '', zip: '' };
    
    // Try to parse address like "123 Main St, Austin, TX 78701"
    const parts = fullAddress.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      const stateZip = parts[parts.length - 1].split(' ');
      return {
        address: parts[0],
        city: parts[parts.length - 2],
        state: stateZip[0] || '',
        zip: stateZip[1] || '',
      };
    }
    return { address: fullAddress, city: '', state: '', zip: '' };
  };
  
  const parsedAddress = initialData ? parseAddress(initialData.address) : null;
  
  // Detect industry from category
  const detectIndustry = (category: any) => {
    if (!category?.displayName) return '';
    const categoryName = category.displayName.toLowerCase();
    
    if (categoryName.includes('landscap') || categoryName.includes('lawn')) return 'landscaping';
    if (categoryName.includes('hvac') || categoryName.includes('heating') || categoryName.includes('cooling')) return 'hvac';
    if (categoryName.includes('plumb')) return 'plumbing';
    if (categoryName.includes('clean')) return 'cleaning';
    if (categoryName.includes('roof')) return 'roofing';
    if (categoryName.includes('electric')) return 'electrical';
    
    return 'general';
  };

  const [formData, setFormData] = useState({
    // Basic Information
    businessName: initialData?.businessName || '',
    industry: detectIndustry(initialData?.primaryCategory),
    subdomain: initialData?.businessName ? generateSubdomain(initialData.businessName) : '',
    phone: initialData?.primaryPhone || '',
    email: '',
    website: initialData?.website || '',
    
    // Address
    address: parsedAddress?.address || '',
    city: parsedAddress?.city || '',
    state: parsedAddress?.state || '',
    zip: parsedAddress?.zip || '',
    
    // Description
    description: initialData?.profile?.description || '',
    
    // Services
    services: '',
    
    // Service Areas
    serviceAreas: '',
    
    // Template
    template: 'modern',
    primaryColor: '#22C55E',
  });

  // Parse regular hours from initial data
  const parseRegularHours = () => {
    const defaultHours: BusinessHours = {
      monday: { open: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { open: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { open: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { open: true, openTime: '09:00', closeTime: '17:00' },
      friday: { open: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { open: false, openTime: '09:00', closeTime: '17:00' },
      sunday: { open: false, openTime: '09:00', closeTime: '17:00' },
    };
    
    if (!initialData?.regularHours?.periods) return defaultHours;
    
    const dayMap: Record<string, string> = {
      'MONDAY': 'monday',
      'TUESDAY': 'tuesday',
      'WEDNESDAY': 'wednesday',
      'THURSDAY': 'thursday',
      'FRIDAY': 'friday',
      'SATURDAY': 'saturday',
      'SUNDAY': 'sunday',
    };
    
    // Reset all to closed first
    const parsedHours = { ...defaultHours };
    Object.keys(parsedHours).forEach(day => {
      parsedHours[day].open = false;
    });
    
    // Parse periods
    initialData.regularHours.periods.forEach((period: any) => {
      if (period.openDay && period.openTime && period.closeTime) {
        const dayKey = dayMap[period.openDay];
        if (dayKey) {
          let openHour, openMin, closeHour, closeMin;
          
          // Handle both string format (HHMM) and object format ({hours: 8, minutes: 0})
          if (typeof period.openTime === 'string') {
            openHour = period.openTime.substring(0, 2);
            openMin = period.openTime.substring(2, 4);
          } else if (period.openTime.hours !== undefined) {
            openHour = period.openTime.hours.toString().padStart(2, '0');
            openMin = (period.openTime.minutes || 0).toString().padStart(2, '0');
          } else {
            return; // Skip if format is unknown
          }
          
          if (typeof period.closeTime === 'string') {
            closeHour = period.closeTime.substring(0, 2);
            closeMin = period.closeTime.substring(2, 4);
          } else if (period.closeTime.hours !== undefined) {
            closeHour = period.closeTime.hours.toString().padStart(2, '0');
            closeMin = (period.closeTime.minutes || 0).toString().padStart(2, '0');
          } else {
            return; // Skip if format is unknown
          }
          
          parsedHours[dayKey] = {
            open: true,
            openTime: `${openHour}:${openMin}`,
            closeTime: `${closeHour}:${closeMin}`,
          };
        }
      }
    });
    
    return parsedHours;
  };

  const [businessHours, setBusinessHours] = useState<BusinessHours>(parseRegularHours());

  // Call onUpdate whenever form data changes
  useEffect(() => {
    if (onUpdate) {
      onUpdate({
        ...formData,
        businessHours,
        gbpPlaceId: initialData?.placeId,
      });
    }
  }, [formData, businessHours, initialData?.placeId, onUpdate]);

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.businessName || !formData.industry || !formData.phone || 
        !formData.address || !formData.city || !formData.state || !formData.zip) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setCurrentStep('hours');
  };

  const handleHoursSubmit = () => {
    setCurrentStep('services');
  };

  const handleFinalSubmit = async () => {
    if (!formData.services || !formData.description) {
      toast.error('Please provide services and description');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare the data
      const siteData = {
        businessName: formData.businessName,
        subdomain: formData.subdomain || generateSubdomain(formData.businessName),
        industry: formData.industry,
        template: formData.template,
        primaryColor: formData.primaryColor,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        description: formData.description,
        services: formData.services.split('\n').filter(s => s.trim()),
        serviceAreas: formData.serviceAreas.split(',').map(s => s.trim()).filter(s => s),
        regularHours: businessHours,
      };

      await onComplete(siteData);
    } catch (error) {
      toast.error('Failed to create site');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Set Up Your Business
        </h2>
        <p className="text-gray-600">
          {currentStep === 'basic' && "Let's start with your business information"}
          {currentStep === 'hours' && "When are you open for business?"}
          {currentStep === 'services' && "What services do you offer?"}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${currentStep === 'basic' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`w-2 h-2 rounded-full ${currentStep === 'hours' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`w-2 h-2 rounded-full ${currentStep === 'services' ? 'bg-blue-600' : 'bg-gray-300'}`} />
      </div>

      {/* Basic Information Step */}
      {currentStep === 'basic' && (
        <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
          {/* Show notice if data is pre-filled */}
          {initialData && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>✏️ Editing Mode:</strong> We've pre-filled your business information from Google. 
                Review and make any necessary changes below.
              </p>
            </Card>
          )}
          
          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="ABC Landscaping"
                required
              />
            </div>

            {/* Industry */}
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Business Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@business.com"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website">Current Website (optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.example.com"
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Business Address
              </h3>
              
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Austin"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                  >
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="78701"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Subdomain */}
            <div>
              <Label htmlFor="subdomain">Your Website Address</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  placeholder={generateSubdomain(formData.businessName || 'mybusiness')}
                  pattern="[a-z0-9-]+"
                />
                <span className="text-gray-500 text-sm">.suitebusiness.com</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to auto-generate from business name
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button type="submit">
              Continue to Hours
            </Button>
          </div>
        </form>
      )}

      {/* Business Hours Step */}
      {currentStep === 'hours' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Business Hours
            </h3>
            
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={businessHours[day.key].open}
                      onCheckedChange={(checked) => 
                        setBusinessHours({
                          ...businessHours,
                          [day.key]: { ...businessHours[day.key], open: checked }
                        })
                      }
                    />
                    <Label className="w-24">{day.label}</Label>
                  </div>
                  
                  {businessHours[day.key].open ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={businessHours[day.key].openTime}
                        onChange={(e) => 
                          setBusinessHours({
                            ...businessHours,
                            [day.key]: { ...businessHours[day.key], openTime: e.target.value }
                          })
                        }
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={businessHours[day.key].closeTime}
                        onChange={(e) => 
                          setBusinessHours({
                            ...businessHours,
                            [day.key]: { ...businessHours[day.key], closeTime: e.target.value }
                          })
                        }
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentStep('basic')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleHoursSubmit}>
              Continue to Services
            </Button>
          </div>
        </div>
      )}

      {/* Services & Description Step */}
      {currentStep === 'services' && (
        <div className="space-y-6">
          {/* Business Description */}
          <div>
            <Label htmlFor="description">Business Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell customers about your business, what makes you unique, and why they should choose you..."
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will appear on your website's homepage
            </p>
          </div>

          {/* Services */}
          <div>
            <Label htmlFor="services">Services Offered *</Label>
            <Textarea
              id="services"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              placeholder="Enter each service on a new line:
Lawn Mowing
Tree Trimming
Landscape Design
Sprinkler Installation"
              rows={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter each service on a new line
            </p>
          </div>

          {/* Service Areas */}
          <div>
            <Label htmlFor="serviceAreas">Service Areas (optional)</Label>
            <Input
              id="serviceAreas"
              value={formData.serviceAreas}
              onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
              placeholder="Austin, Round Rock, Cedar Park, Pflugerville"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cities or areas you serve, separated by commas
            </p>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentStep('hours')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleFinalSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating your site...
                </>
              ) : (
                'Create My Site'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}