import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, Phone, MapPin, Clock, ExternalLink, Settings, 
  Edit, Trash2, BarChart, Eye, EyeOff, Briefcase, CheckCircle,
  ArrowLeft, Users, FileText, Calendar, Shield, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/QuickStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

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

  const domain = site.customDomain || `${site.subdomain}.${process.env.NODE_ENV === 'development' ? 'localhost:3000' : process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  const siteUrl = process.env.NODE_ENV === 'development' 
    ? `http://${domain}`
    : `https://${domain}`;

  // Mock data for recent activity - replace with real data
  const recentActivities = [
    {
      id: '1',
      type: 'form_submission' as const,
      title: 'Form submission from contact page',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      siteName: site.businessName,
    },
    {
      id: '2',
      type: 'lead_created' as const,
      title: 'New lead captured',
      description: 'John Doe - john@example.com',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      siteName: site.businessName,
    },
    {
      id: '3',
      type: 'site_published' as const,
      title: 'Page "Services" updated',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      siteName: site.businessName,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Site Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="h-16 w-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: site.primaryColor || '#22C55E' }}
            >
              {site.logo ? (
                <img 
                  src={site.logo} 
                  alt={site.businessName} 
                  className="h-14 w-14 object-contain"
                />
              ) : (
                <Globe className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{site.businessName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <a 
                  href={siteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {domain}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Badge 
                  variant={site.published ? "default" : "secondary"}
                  className={site.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                  {site.published ? "Published" : "Draft"}
                </Badge>
                {site.industryConfirmed && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/preview/${site.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </Button>
            {site.published && (
              <Button variant="outline" asChild>
                <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Views"
          value="1,234"
          icon={Eye}
          description="This month"
          trend={{ value: 12, label: "from last month" }}
        />
        <StatCard
          title="Leads"
          value="45"
          icon={Users}
          description="Total captured"
        />
        <StatCard
          title="Pages"
          value={site.pages.length}
          icon={FileText}
          description="Published pages"
        />
        <StatCard
          title="Services"
          value={site.services.length}
          icon={Briefcase}
          description="Active services"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivities} />
        </div>

        {/* Right Column - Site Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Industry</p>
                <p className="font-medium capitalize">{site.industry}</p>
              </div>
              
              {site.phone && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </p>
                  <p className="font-medium">{site.phone}</p>
                </div>
              )}
              
              {site.address && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </p>
                  <p className="font-medium">
                    {site.address}
                    {site.city && site.state && site.zip && (
                      <><br />{site.city}, {site.state} {site.zip}</>
                    )}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </p>
                <p className="font-medium">
                  {new Date(site.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Updated
                </p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(site.updatedAt), { addSuffix: true })}
                </p>
              </div>
              
              {site.gbpLocationId && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Google Business Profile
                  </p>
                  <p className="font-medium text-green-600">Connected</p>
                </div>
              )}
              
              {site.customDomain && (
                <div>
                  <p className="text-sm text-gray-500">Custom Domain</p>
                  <p className="font-medium">{site.customDomain}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/dashboard/sites/${site.id}/pages`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Pages
                </Link>
              </Button>
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/dashboard/sites/${site.id}/services`}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Services
                </Link>
              </Button>
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/dashboard/sites/${site.id}/seo`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
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
            </CardContent>
          </Card>
        </div>
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
