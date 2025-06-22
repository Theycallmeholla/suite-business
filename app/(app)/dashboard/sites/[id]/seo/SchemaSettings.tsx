'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Code, Info } from 'lucide-react';
import { toast } from '@/lib/toast';

interface SchemaSettingsProps {
  site: {
    id: string;
    businessName: string;
    industry: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    businessHours?: any;
    priceRange?: string | null;
    servesArea?: string | null;
    schemaType?: string | null;
    acceptsReservations?: boolean | null;
    menuUrl?: string | null;
  };
}

const businessTypes = [
  { value: 'LocalBusiness', label: 'Local Business (General)' },
  { value: 'HomeAndConstructionBusiness', label: 'Home & Construction' },
  { value: 'Plumber', label: 'Plumber' },
  { value: 'Electrician', label: 'Electrician' },
  { value: 'RoofingContractor', label: 'Roofing Contractor' },
  { value: 'GeneralContractor', label: 'General Contractor' },
  { value: 'HVACBusiness', label: 'HVAC Business' },
  { value: 'LandscapingService', label: 'Landscaping Service' },
  { value: 'HousePainter', label: 'House Painter' },
  { value: 'Locksmith', label: 'Locksmith' },
  { value: 'MovingCompany', label: 'Moving Company' },
  { value: 'ProfessionalService', label: 'Professional Service' },
  { value: 'CleaningService', label: 'Cleaning Service' },
  { value: 'AutoRepair', label: 'Auto Repair' },
];

export function SchemaSettings({ site }: SchemaSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateSchema = (formData: FormData) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': formData.get('schemaType') || 'LocalBusiness',
      name: site.businessName,
      telephone: site.phone,
      email: site.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address,
        addressLocality: site.city,
        addressRegion: site.state,
        postalCode: site.zip,
        addressCountry: 'US',
      },
      ...(site.latitude && site.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: site.latitude,
          longitude: site.longitude,
        },
      }),
      ...(formData.get('priceRange') && {
        priceRange: formData.get('priceRange'),
      }),
      ...(formData.get('servesArea') && {
        areaServed: formData.get('servesArea')?.toString().split(',').map(area => area.trim()),
      }),
      ...(formData.get('acceptsReservations') === 'on' && {
        acceptsReservations: true,
      }),
      ...(formData.get('menuUrl') && {
        menu: formData.get('menuUrl'),
      }),
      ...(site.businessHours && {
        openingHoursSpecification: site.businessHours.periods?.map((period: any) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: getDayName(period.openDay),
          opens: period.openTime,
          closes: period.closeTime,
        })),
      }),
    };

    return JSON.stringify(schema, null, 2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(`/api/sites/${site.id}/seo/schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaType: formData.get('schemaType'),
          priceRange: formData.get('priceRange'),
          servesArea: formData.get('servesArea'),
          acceptsReservations: formData.get('acceptsReservations') === 'on',
          menuUrl: formData.get('menuUrl'),
        }),
      });

      if (!response.ok) throw new Error('Failed to update schema settings');

      toast.success('Schema settings updated successfully');
    } catch (error) {
      toast.error('Failed to update schema settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Structured Data (Schema.org)
        </CardTitle>
        <CardDescription>
          Enhance your search appearance with rich results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="schemaType">Business Type</Label>
            <Select name="schemaType" defaultValue={site.schemaType || 'LocalBusiness'}>
              <SelectTrigger>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose the most specific type that matches your business
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceRange">Price Range</Label>
            <Select name="priceRange" defaultValue={site.priceRange || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$ - Budget Friendly</SelectItem>
                <SelectItem value="$$">$$ - Moderate</SelectItem>
                <SelectItem value="$$$">$$$ - Premium</SelectItem>
                <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servesArea">Service Areas</Label>
            <Textarea
              id="servesArea"
              name="servesArea"
              placeholder="e.g., Houston, Spring, The Woodlands, Katy"
              defaultValue={site.servesArea || ''}
              rows={2}
            />
            <p className="text-xs text-gray-500">
              Comma-separated list of cities or areas you serve
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="acceptsReservations"
              name="acceptsReservations"
              defaultChecked={site.acceptsReservations || false}
            />
            <Label htmlFor="acceptsReservations" className="font-normal">
              Business accepts reservations or appointments
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menuUrl">Services/Menu URL (optional)</Label>
            <Input
              id="menuUrl"
              name="menuUrl"
              type="url"
              placeholder="https://example.com/services"
              defaultValue={site.menuUrl || ''}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Code className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} JSON-LD Preview
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Schema Settings'}
            </Button>
          </div>
        </form>

        {showPreview && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">JSON-LD Preview</span>
            </div>
            <pre className="text-xs overflow-x-auto bg-gray-900 text-gray-100 p-3 rounded">
              {generateSchema(new FormData(document.querySelector('form')!))}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
}