import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Globe, Phone, MapPin, Palette, Search, 
  Save, ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/toast';
import { revalidatePath } from 'next/cache';
import { AdvancedSettings } from './AdvancedSettings';
import { CustomDomain } from './CustomDomain';
import { DomainHelp } from './DomainHelp';

async function updateSite(siteId: string, formData: FormData) {
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

  try {
    await prisma.site.update({
      where: { id: siteId },
      data: {
        businessName: formData.get('businessName') as string,
        subdomain: (formData.get('subdomain') as string).toLowerCase(),
        phone: formData.get('phone') as string || null,
        email: formData.get('email') as string || null,
        address: formData.get('address') as string || null,
        city: formData.get('city') as string || null,
        state: formData.get('state') as string || null,
        zip: formData.get('zip') as string || null,
        metaTitle: formData.get('metaTitle') as string || null,
        metaDescription: formData.get('metaDescription') as string || null,
        primaryColor: formData.get('primaryColor') as string,
      },
    });

    revalidatePath(`/dashboard/sites/${siteId}`);
    revalidatePath(`/dashboard/sites/${siteId}/settings`);
  } catch (error) {
    throw new Error('Failed to update site');
  }
}

async function togglePublish(siteId: string, published: boolean) {
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
    data: { published },
  });

  revalidatePath(`/dashboard/sites/${siteId}`);
  revalidatePath(`/dashboard/sites/${siteId}/settings`);
}

async function deleteSite(siteId: string, deleteGHL: boolean = false) {
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

  // If requested and GHL location exists, delete it
  if (deleteGHL && site.ghlLocationId) {
    try {
      const { createGHLProClient } = await import('@/lib/ghl');
      const ghlClient = createGHLProClient();

      // Delete the GHL sub-account
      await ghlClient.deleteLocation(site.ghlLocationId);
    } catch (error) {
      console.error('Failed to delete GHL location:', error);
      // Continue with site deletion even if GHL deletion fails
    }
  }

  // Delete all related data
  await prisma.$transaction([
    prisma.service.deleteMany({ where: { siteId } }),
    prisma.page.deleteMany({ where: { siteId } }),
    prisma.site.delete({ where: { id: siteId } }),
  ]);

  redirect('/dashboard');
}

export default async function SiteSettingsPage({ params }: { params: Promise<{ id: string }> }) {
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
    include: {
      services: true,
      pages: true,
    },
  });

  if (!site) {
    notFound();
  }

  const siteUrl = process.env.NODE_ENV === 'development' 
    ? `http://${site.subdomain}.localhost:3000`
    : `https://${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

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
            <h1 className="text-3xl font-bold">Site Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your site configuration and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            {site.published ? (
              <Badge className="bg-green-100 text-green-700">
                <Eye className="h-3 w-3 mr-1" />
                Published
              </Badge>
            ) : (
              <Badge variant="secondary">
                <EyeOff className="h-3 w-3 mr-1" />
                Draft
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <form action={updateSite.bind(null, site.id)}>
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Basic information about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      defaultValue={site.businessName}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="subdomain"
                        name="subdomain"
                        defaultValue={site.subdomain}
                        pattern="[a-z0-9-]+"
                        required
                      />
                      <span className="text-sm text-gray-500">.localhost:3000</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Only lowercase letters, numbers, and hyphens
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={site.phone || ''}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={site.email || ''}
                      placeholder="contact@business.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={site.address || ''}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={site.city || ''}
                      placeholder="Houston"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      defaultValue={site.state || ''}
                      placeholder="TX"
                      maxLength={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      defaultValue={site.zip || ''}
                      placeholder="77001"
                      pattern="[0-9]{5}"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="domain" className="space-y-6">
          <CustomDomain 
            siteId={site.id}
            subdomain={site.subdomain}
            currentDomain={site.customDomain}
          />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <form action={updateSite.bind(null, site.id)}>
            <Card>
              <CardHeader>
                <CardTitle>Search Engine Optimization</CardTitle>
                <CardDescription>
                  Optimize how your site appears in search results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    defaultValue={site.metaTitle || ''}
                    placeholder={`${site.businessName} - Professional Services`}
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    defaultValue={site.metaDescription || ''}
                    placeholder="Describe your business and services..."
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 150-160 characters
                  </p>
                </div>

                {/* Hidden fields to preserve other data */}
                <input type="hidden" name="businessName" value={site.businessName} />
                <input type="hidden" name="subdomain" value={site.subdomain} />
                <input type="hidden" name="primaryColor" value={site.primaryColor} />

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save SEO Settings
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <form action={updateSite.bind(null, site.id)}>
            <Card>
              <CardHeader>
                <CardTitle>Site Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      defaultValue={site.primaryColor}
                      className="h-12 w-20"
                    />
                    <Input
                      type="text"
                      value={site.primaryColor}
                      readOnly
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    This color will be used for buttons, links, and accents
                  </p>
                </div>

                {site.logo && (
                  <div className="space-y-2">
                    <Label>Current Logo</Label>
                    <img 
                      src={site.logo} 
                      alt="Site logo" 
                      className="h-16 object-contain"
                    />
                  </div>
                )}

                {/* Hidden fields to preserve other data */}
                <input type="hidden" name="businessName" value={site.businessName} />
                <input type="hidden" name="subdomain" value={site.subdomain} />

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance Settings
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedSettings 
            site={site}
            siteUrl={siteUrl}
            togglePublishAction={togglePublish}
            deleteSiteAction={deleteSite}
          />
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <DomainHelp />
        </TabsContent>
      </Tabs>
    </div>
  );
}