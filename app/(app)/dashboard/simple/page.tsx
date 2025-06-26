import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Phone, Users, Globe, Clock, Calendar, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function SimplifiedDashboard() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get user's sites
  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    include: {
      forms: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (sites.length === 0) {
    redirect('/onboarding');
  }

  // For simplicity, focus on the first/primary site
  const primarySite = sites[0];

  // Get form submissions from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSubmissions = await prisma.formSubmission.findMany({
    where: {
      siteId: primarySite.id,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Simple lead extraction
  const leads = recentSubmissions.map(submission => {
    const data = submission.data as any;
    return {
      id: submission.id,
      name: data.name || data.firstName || 'Unknown',
      phone: data.phone || data.phoneNumber || 'No phone',
      email: data.email || '',
      message: data.message || '',
      date: submission.createdAt,
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Simple Header */}
      <div>
        <h1 className="text-2xl font-bold">{primarySite.businessName}</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/dashboard/sites/${primarySite.id}/leads`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{leads.length}</p>
                <p className="text-gray-600 mt-1">New leads this week</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
            {leads.length > 0 && (
              <p className="text-sm text-blue-600 mt-4">Click to view leads →</p>
            )}
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <a href={`https://${primarySite.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Your Website</p>
                <p className="text-gray-600 mt-1">
                  {primarySite.published ? 'Live & Active' : 'Draft Mode'}
                </p>
              </div>
              <Globe className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-sm text-green-600 mt-4">Visit your website →</p>
          </a>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/dashboard/sites/${primarySite.id}/edit`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Quick Updates</p>
                <p className="text-gray-600 mt-1">Edit hours & info</p>
              </div>
              <Clock className="h-12 w-12 text-purple-500" />
            </div>
            <p className="text-sm text-purple-600 mt-4">Update business info →</p>
          </Link>
        </Card>
      </div>

      {/* Recent Leads - Simplified View */}
      {leads.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Leads</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/sites/${primarySite.id}/leads`}>View All</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{lead.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <a href={`tel:${lead.phone}`} className="text-sm text-blue-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </a>
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="text-sm text-gray-600">
                        {lead.email}
                      </a>
                    )}
                  </div>
                  {lead.message && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">{lead.message}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(lead.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(lead.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">What You Can Do</h3>
          <div className="space-y-3">
            <Link href={`/dashboard/sites/${primarySite.id}/edit`} className="flex items-center gap-3 text-sm hover:text-blue-600">
              <Calendar className="h-4 w-4" />
              Update business hours
            </Link>
            <Link href={`/dashboard/sites/${primarySite.id}/photos`} className="flex items-center gap-3 text-sm hover:text-blue-600">
              <Globe className="h-4 w-4" />
              Add photos to your website
            </Link>
            <Link href={`/dashboard/sites/${primarySite.id}/services`} className="flex items-center gap-3 text-sm hover:text-blue-600">
              <TrendingUp className="h-4 w-4" />
              Update your services
            </Link>
            <Link href="/support" className="flex items-center gap-3 text-sm hover:text-blue-600">
              <MessageSquare className="h-4 w-4" />
              Get help & support
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Tips for Success</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Respond to leads quickly</p>
                <p className="text-xs text-gray-600">Call new leads within 1 hour for best results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Keep your hours updated</p>
                <p className="text-xs text-gray-600">Customers check your hours before calling</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-purple-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Add photos regularly</p>
                <p className="text-xs text-gray-600">Show your best work to attract more customers</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Advanced Features - Hidden by Default */}
      <Card className="p-6 border-dashed">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Want to see more advanced features?</p>
          <Button variant="outline" asChild>
            <Link href="/dashboard/advanced">View Advanced Dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}