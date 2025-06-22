'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Building2, Globe, Palette, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface BusinessInfoFormProps {
  selectedBusinessId: string;
  businesses: Array<{ 
    id: string; 
    name: string; 
    address: string; 
    website?: string | null;
  }>;
  onComplete: () => void;
}

const INDUSTRIES = [
  { value: 'landscaping', label: 'Landscaping & Lawn Care' },
  { value: 'hvac', label: 'HVAC (Heating & Cooling)' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'electrical', label: 'Electrical' },
];

const TEMPLATES = [
  { value: 'modern', label: 'Modern', color: '#22C55E' },
  { value: 'professional', label: 'Professional', color: '#3B82F6' },
  { value: 'bold', label: 'Bold', color: '#EF4444' },
];

// Generate subdomain suggestion from business name
const generateSubdomain = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30);
};

export function BusinessInfoForm({ selectedBusinessId, businesses, onComplete }: BusinessInfoFormProps) {
  const { data: session } = useSession();
  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
  
  // Map Google categories to our industries
  const detectIndustry = (category: any) => {
    if (!category?.displayName) return '';
    const categoryName = category.displayName.toLowerCase();
    
    if (categoryName.includes('landscap') || categoryName.includes('lawn')) return 'landscaping';
    if (categoryName.includes('hvac') || categoryName.includes('heating') || categoryName.includes('cooling')) return 'hvac';
    if (categoryName.includes('plumb')) return 'plumbing';
    if (categoryName.includes('clean')) return 'cleaning';
    if (categoryName.includes('roof')) return 'roofing';
    if (categoryName.includes('electric')) return 'electrical';
    
    return '';
  };

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState({
    industry: '',
    subdomain: selectedBusiness ? generateSubdomain(selectedBusiness.name) : '',
    template: 'modern',
    primaryColor: '#22C55E',
    phone: '',
    description: '',
    services: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create the site
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: selectedBusiness?.name || 'My Business',
          subdomain: formData.subdomain,
          industry: formData.industry,
          template: formData.template,
          primaryColor: formData.primaryColor,
          phone: formData.phone,
          address: selectedBusiness?.address,
          description: formData.description,
          services: formData.services.split('\n').filter(s => s.trim()),
          googleBusinessId: selectedBusinessId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create site');
      }

      const site = await response.json();

      // Automatically set up GoHighLevel integration
      setLoadingMessage('Setting up your CRM and automation tools...');
      try {
        const ghlResponse = await fetch('/api/ghl/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteId: site.id,
            businessName: selectedBusiness?.name || 'My Business',
            email: session?.user?.email || '',
            phone: formData.phone,
            address: selectedBusiness?.address || '',
            industry: formData.industry,
            website: `${formData.subdomain}.${window.location.hostname}`,
          }),
        });

        if (!ghlResponse.ok) {
          console.error('GoHighLevel setup failed:', await ghlResponse.text());
          // Don't throw - GHL setup is optional
        }
      } catch (ghlError) {
        console.error('GoHighLevel setup error:', ghlError);
        // Continue even if GHL setup fails
      }

      toast.success('Site created successfully!', {
        description: `Your site is available at ${formData.subdomain}.${window.location.hostname}`,
      });

      onComplete();
    } catch (error: any) {
      toast.error('Failed to create site', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Complete Your Business Setup
        </h2>
        <p className="text-gray-600">
          Tell us more about {selectedBusiness?.name || 'your business'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Industry Selection */}
        <div>
          <Label htmlFor="industry">Industry</Label>
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

        {/* Subdomain */}
        <div>
          <Label htmlFor="subdomain">Your Website Address</Label>
          <div className="flex items-center gap-2">
            <Input
              id="subdomain"
              value={formData.subdomain}
              onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
              placeholder={generateSubdomain(selectedBusiness?.name || 'mybusiness')}
              pattern="[a-z0-9-]+"
              required
            />
            <span className="text-gray-500">.suitebusiness.com</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Choose a unique subdomain for your website (letters, numbers, and dashes only)
          </p>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Business Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell us about your business and what makes you unique..."
            rows={3}
            required
          />
        </div>

        {/* Services */}
        <div>
          <Label htmlFor="services">Services Offered</Label>
          <Textarea
            id="services"
            value={formData.services}
            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            placeholder="Enter each service on a new line:
Lawn Mowing
Tree Trimming
Landscape Design"
            rows={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter each service on a new line
          </p>
        </div>

        {/* Template Selection */}
        <div>
          <Label>Website Template</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.value}
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  template: template.value, 
                  primaryColor: template.color 
                })}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.template === template.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div 
                  className="w-full h-20 rounded mb-2"
                  style={{ backgroundColor: template.color }}
                />
                <span className="text-sm font-medium">{template.label}</span>
              </button>
            ))}
          </div>
        </div>


        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !formData.industry || !formData.subdomain}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {loadingMessage || 'Creating your site...'}
            </>
          ) : (
            'Complete Setup'
          )}
        </Button>
      </form>
    </div>
  );
}