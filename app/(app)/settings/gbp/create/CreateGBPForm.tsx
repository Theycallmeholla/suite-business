'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, ChevronLeft, Loader2, AlertCircle, CheckCircle2, Info, MapPin, Phone, Globe } from 'lucide-react';
import { toast } from '@/lib/toast';
import Link from 'next/link';

interface Site {
  id: string;
  businessName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  businessHours?: any;
  industry?: string;
  metaDescription?: string | null;
}

interface CreateGBPFormProps {
  site: Site;
}

const BUSINESS_TYPES = [
  { value: 'LOCATION', label: 'Physical location customers visit' },
  { value: 'SERVICE_AREA', label: 'Service area business (we visit customers)' },
  { value: 'HYBRID', label: 'Both physical location and service area' },
];

export function CreateGBPForm({ site }: CreateGBPFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'verify' | 'review'>('info');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    businessType: 'LOCATION',
    serviceAreas: '',
    additionalCategories: '',
    yearEstablished: '',
    shortDescription: site.metaDescription || '',
    longDescription: '',
    websiteUrl: `https://${site.subdomain}.suitebusiness.com`,
    hideAddress: false,
  });

  const [verificationData, setVerificationData] = useState({
    contactName: '',
    contactPhone: site.phone || '',
    contactEmail: site.email || '',
    verificationMethod: 'postcard', // postcard, phone, email, instant
  });

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('verify');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationData.contactName || !verificationData.contactPhone || !verificationData.contactEmail) {
      toast.error('Please fill in all contact information');
      return;
    }
    
    setCurrentStep('review');
  };

  const handleFinalSubmit = async () => {
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/gbp/create-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: site.id,
          businessInfo: {
            title: site.businessName,
            address: {
              addressLines: [site.address || ''],
              locality: site.city || '',
              administrativeArea: site.state || '',
              postalCode: site.zip || '',
              regionCode: 'US',
            },
            phoneNumbers: site.phone ? { primary: site.phone } : undefined,
            websiteUri: formData.websiteUrl,
            regularHours: site.businessHours,
            businessType: formData.businessType,
            serviceAreas: formData.serviceAreas.split(',').map(s => s.trim()).filter(s => s),
            categories: formData.additionalCategories.split(',').map(s => s.trim()).filter(s => s),
            profile: {
              description: formData.longDescription || formData.shortDescription,
            },
          },
          verificationInfo: {
            contactName: verificationData.contactName,
            contactPhone: verificationData.contactPhone,
            contactEmail: verificationData.contactEmail,
            method: verificationData.verificationMethod,
          },
          hideAddress: formData.hideAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create Google Business Profile');
      }

      const result = await response.json();
      
      toast.success('Google Business Profile created successfully!', {
        description: result.verificationRequired 
          ? 'Verification instructions will be sent to your contact information.'
          : 'Your profile is now active on Google.',
      });

      // Redirect back to dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      toast.error('Failed to create profile', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Google Business Profile</h1>
          <p className="text-gray-600 mt-1">
            Set up {site.businessName} on Google to reach more customers
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center ${currentStep === 'info' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">Business Info</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className={`flex items-center ${currentStep === 'verify' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'verify' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Verification</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium">Review & Submit</span>
        </div>
      </div>

      <Card className="p-8">
        {/* Step 1: Business Information */}
        {currentStep === 'info' && (
          <form onSubmit={handleInfoSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </h2>

              {/* Current Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-medium text-sm text-gray-700">Current Information from Your Site</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Business Name:</strong> {site.businessName}</p>
                  <p><strong>Address:</strong> {site.address}, {site.city}, {site.state} {site.zip}</p>
                  {site.phone && <p><strong>Phone:</strong> {site.phone}</p>}
                  {site.email && <p><strong>Email:</strong> {site.email}</p>}
                </div>
              </div>

              {/* Business Type */}
              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                >
                  <SelectTrigger id="businessType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Areas (if applicable) */}
              {(formData.businessType === 'SERVICE_AREA' || formData.businessType === 'HYBRID') && (
                <div>
                  <Label htmlFor="serviceAreas">Service Areas</Label>
                  <Input
                    id="serviceAreas"
                    value={formData.serviceAreas}
                    onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
                    placeholder="Austin, Round Rock, Cedar Park"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cities or areas you serve, separated by commas
                  </p>
                </div>
              )}

              {/* Hide Address Option */}
              {formData.businessType === 'SERVICE_AREA' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hideAddress"
                    checked={formData.hideAddress}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, hideAddress: checked as boolean })
                    }
                  />
                  <Label htmlFor="hideAddress" className="text-sm cursor-pointer">
                    Hide my business address (recommended for home-based businesses)
                  </Label>
                </div>
              )}

              {/* Year Established */}
              <div>
                <Label htmlFor="yearEstablished">Year Established (optional)</Label>
                <Input
                  id="yearEstablished"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.yearEstablished}
                  onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
                  placeholder={new Date().getFullYear().toString()}
                />
              </div>

              {/* Short Description */}
              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description of your business (appears in search results)"
                  rows={2}
                  maxLength={750}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.shortDescription.length}/750 characters
                </p>
              </div>

              {/* Long Description */}
              <div>
                <Label htmlFor="longDescription">Detailed Description (optional)</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  placeholder="Detailed information about your services, specialties, and what makes you unique"
                  rows={4}
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.longDescription.length}/5000 characters
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                Continue to Verification
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Verification Information */}
        {currentStep === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Verification Information
              </h2>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Verification Required</p>
                    <p className="text-yellow-700">
                      Google requires businesses to verify their information to prevent fraud. 
                      This typically takes 1-2 weeks via postcard, or may be instant for some businesses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={verificationData.contactName}
                  onChange={(e) => setVerificationData({ ...verificationData, contactName: e.target.value })}
                  placeholder="John Smith"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Person responsible for managing this listing
                </p>
              </div>

              {/* Contact Phone */}
              <div>
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={verificationData.contactPhone}
                  onChange={(e) => setVerificationData({ ...verificationData, contactPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number for verification purposes
                </p>
              </div>

              {/* Contact Email */}
              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={verificationData.contactEmail}
                  onChange={(e) => setVerificationData({ ...verificationData, contactEmail: e.target.value })}
                  placeholder="john@business.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email for verification and account notifications
                </p>
              </div>

              {/* Verification Method */}
              <div>
                <Label>Preferred Verification Method</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="postcard"
                      checked={verificationData.verificationMethod === 'postcard'}
                      onChange={(e) => setVerificationData({ ...verificationData, verificationMethod: e.target.value })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Postcard (most common, 1-2 weeks)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="phone"
                      checked={verificationData.verificationMethod === 'phone'}
                      onChange={(e) => setVerificationData({ ...verificationData, verificationMethod: e.target.value })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Phone call (if eligible)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="email"
                      checked={verificationData.verificationMethod === 'email'}
                      onChange={(e) => setVerificationData({ ...verificationData, verificationMethod: e.target.value })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Email (if eligible)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="instant"
                      checked={verificationData.verificationMethod === 'instant'}
                      onChange={(e) => setVerificationData({ ...verificationData, verificationMethod: e.target.value })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Instant verification (if eligible)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Google will determine which methods are available for your business
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep('info')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit">
                Review & Submit
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Review Your Information</h2>

            {/* Business Summary */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Business Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-600">Business Name</dt>
                    <dd className="font-medium">{site.businessName}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Business Type</dt>
                    <dd className="font-medium">
                      {BUSINESS_TYPES.find(t => t.value === formData.businessType)?.label}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-600">Address</dt>
                    <dd className="font-medium">
                      {site.address}, {site.city}, {site.state} {site.zip}
                      {formData.hideAddress && ' (Hidden from public)'}
                    </dd>
                  </div>
                  {formData.serviceAreas && (
                    <div className="col-span-2">
                      <dt className="text-gray-600">Service Areas</dt>
                      <dd className="font-medium">{formData.serviceAreas}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-600">Phone</dt>
                    <dd className="font-medium">{site.phone || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Website</dt>
                    <dd className="font-medium">{formData.websiteUrl}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Verification Contact</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-600">Contact Name</dt>
                    <dd className="font-medium">{verificationData.contactName}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Contact Phone</dt>
                    <dd className="font-medium">{verificationData.contactPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Contact Email</dt>
                    <dd className="font-medium">{verificationData.contactEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Verification Method</dt>
                    <dd className="font-medium capitalize">{verificationData.verificationMethod}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I understand and agree to the following:
                  </Label>
                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                    <li>• I am authorized to manage this business listing</li>
                    <li>• All information provided is accurate and up-to-date</li>
                    <li>• Google will verify this information before the listing goes live</li>
                    <li>• I will comply with Google Business Profile policies</li>
                    <li>• The listing will be publicly visible on Google Search and Maps</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">What Happens Next?</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Your listing will be created but not visible until verified</li>
                    <li>• Google will send verification instructions to your contact information</li>
                    <li>• Once verified, your business will appear on Google Maps and Search</li>
                    <li>• We'll automatically sync your website data with your Google listing</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep('verify')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleFinalSubmit} 
                disabled={isLoading || !acceptedTerms}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Google Business Profile'
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}