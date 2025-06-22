import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, Phone, MapPin, Clock, ExternalLink, Settings, 
  Edit, Trash2, BarChart, Eye, EyeOff, Briefcase, CheckCircle,
  ArrowLeft, Users
} from 'lucide-react';
import Link from 'next/link';

export default async function SiteDashboard({ params }: { params: Promise<{ id: string }> }) {
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
      services: {
        orderBy: { order: 'asc' },
      },
      pages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  const siteUrl = process.env.NODE_ENV === 'development' 
    ? `http://${site.subdomain}.localhost:3000`
    : `https://${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{site.businessName}</h1>
            <p className="text-gray-600 mt-1">
              Manage your site settings and content
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href={`/preview/${site.id}`} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Link>
            </Button>
            {site.published && (
              <Button variant="outline" asChild>
                <Link href={siteUrl} target="_blank" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Live
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-semibold flex items-center gap-2">
                {site.published ? (
                  <>
                    <Eye className="h-5 w-5 text-green-500" />
                    Published
                  </>
                ) : (
                  <>
                    <EyeOff className="h-5 w-5 text-gray-400" />
                    Draft
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pages</p>
              <p className="text-2xl font-semibold">{site.pages.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Services</p>
              <p className="text-2xl font-semibold">{site.services.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Industry</p>
              <p className="text-2xl font-semibold capitalize flex items-center gap-2">
                {site.industry}
                {site.industryConfirmed && (
                  <CheckCircle className="h-5 w-5 text-green-500" title="Confirmed" />
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Site Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Site Information</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Website</p>
                <a 
                  href={siteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {site.subdomain}.{process.env.NODE_ENV === 'development' ? 'localhost:3000' : process.env.NEXT_PUBLIC_ROOT_DOMAIN}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            {site.phone && (
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p>{site.phone}</p>
                </div>
              </div>
            )}
            
            {site.address && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p>{site.address}</p>
                  {site.city && site.state && site.zip && (
                    <p>{site.city}, {site.state} {site.zip}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p>{new Date(site.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/dashboard/sites/${site.id}/pages`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Pages
              </Link>
            </Button>
            
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/dashboard/sites/${site.id}/services`}>
                <Edit className="h-4 w-4 mr-2" />
                Manage Services
              </Link>
            </Button>
            
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/dashboard/sites/${site.id}/seo`}>
                <BarChart className="h-4 w-4 mr-2" />
                SEO Settings
              </Link>
            </Button>
            
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/dashboard/sites/${site.id}/crm`}>
                <Users className="h-4 w-4 mr-2" />
                CRM Dashboard
              </Link>
            </Button>
            
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href={`/dashboard/sites/${site.id}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Site Settings
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Services List */}
      {site.services.length > 0 && (
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {site.services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                )}
                {service.featured && (
                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Featured
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
