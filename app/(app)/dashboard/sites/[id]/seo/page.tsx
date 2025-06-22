import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Search, Globe, FileText, AlertCircle,
  CheckCircle, TrendingUp, Map, Star
} from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { SchemaSettings } from './SchemaSettings';

async function updateSEO(siteId: string, formData: FormData) {
  'use server';
  
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId: session.user.id,
    },
  });

  if (!site) {
    throw new Error('Site not found');
  }

  await prisma.site.update({
    where: { id: siteId },
    data: {
      metaTitle: formData.get('metaTitle') as string || null,
      metaDescription: formData.get('metaDescription') as string || null,
    },
  });

  revalidatePath(`/dashboard/sites/${siteId}/seo`);
}

export default async function SiteSEOPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const site = await prisma.site.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!site) {
    notFound();
  }

  // SEO Analysis
  const seoScore = {
    metaTitle: site.metaTitle ? 20 : 0,
    metaDescription: site.metaDescription ? 20 : 0,
    address: site.address && site.city && site.state ? 20 : 0,
    phone: site.phone ? 20 : 0,
    services: 20, // Assume they have services
  };
  
  const totalScore = Object.values(seoScore).reduce((a, b) => a + b, 0);

  const suggestions = [];
  if (!site.metaTitle) suggestions.push('Add a meta title');
  if (!site.metaDescription) suggestions.push('Add a meta description');
  if (!site.address || !site.city || !site.state) suggestions.push('Complete your business address');
  if (!site.phone) suggestions.push('Add a phone number');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href={`/dashboard/sites/${site.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Site Dashboard
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SEO Settings</h1>
            <p className="text-gray-600 mt-1">
              Optimize your site for search engines
            </p>
          </div>
        </div>
      </div>

      {/* SEO Score Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>SEO Health Score</span>
            <Badge 
              className={`text-lg px-3 py-1 ${
                totalScore >= 80 ? 'bg-green-100 text-green-800' :
                totalScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {totalScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Meta Title
              </span>
              {site.metaTitle ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Meta Description
              </span>
              {site.metaDescription ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Map className="h-4 w-4 text-gray-500" />
                Business Address
              </span>
              {site.address && site.city && site.state ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                Contact Information
              </span>
              {site.phone ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>

          {suggestions.length > 0 && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Suggestions to improve your SEO:</strong>
                <ul className="list-disc list-inside mt-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Meta Tags Form */}
      <form action={updateSEO.bind(null, site.id)}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Engine Meta Tags</CardTitle>
            <CardDescription>
              Control how your site appears in search results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">
                Page Title
                <span className="text-xs text-gray-500 ml-2">
                  ({site.metaTitle?.length || 0}/60 characters)
                </span>
              </Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                defaultValue={site.metaTitle || ''}
                placeholder={`${site.businessName} - ${site.industry} Services in ${site.city || 'Your City'}`}
                maxLength={60}
              />
              <p className="text-xs text-gray-500">
                This appears as the clickable title in search results. Include your business name and location.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">
                Meta Description
                <span className="text-xs text-gray-500 ml-2">
                  ({site.metaDescription?.length || 0}/160 characters)
                </span>
              </Label>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                defaultValue={site.metaDescription || ''}
                placeholder={`Professional ${site.industry} services in ${site.city || 'your area'}. ${site.businessName} offers quality service with experienced professionals. Call ${site.phone || 'us'} today for a free quote.`}
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-gray-500">
                This appears below your title in search results. Make it compelling to encourage clicks.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Save SEO Settings
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Local SEO Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Local SEO Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                1
              </div>
              <div>
                <h4 className="font-semibold">Include Your Location</h4>
                <p className="text-sm text-gray-600">
                  Always mention your city and service area in titles and descriptions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                2
              </div>
              <div>
                <h4 className="font-semibold">Use Service Keywords</h4>
                <p className="text-sm text-gray-600">
                  Include specific services like "{site.industry} repair" or "{site.industry} installation"
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                3
              </div>
              <div>
                <h4 className="font-semibold">Complete Your NAP</h4>
                <p className="text-sm text-gray-600">
                  Ensure your Name, Address, and Phone (NAP) are consistent everywhere
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                4
              </div>
              <div>
                <h4 className="font-semibold">Connect Google Business Profile</h4>
                <p className="text-sm text-gray-600">
                  Link your GBP account to boost local search visibility
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schema.org Structured Data */}
      <div className="mt-8">
        <SchemaSettings site={site} />
      </div>
    </div>
  );
}