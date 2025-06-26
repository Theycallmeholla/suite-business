import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Clock,
  Globe,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard } from '@/components/dashboard/QuickStats';

export default async function SiteAnalyticsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
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

  // Mock analytics data - replace with real analytics
  const analytics = {
    overview: {
      totalViews: 15234,
      uniqueVisitors: 4532,
      avgSessionDuration: '4m 12s',
      bounceRate: '38%',
      conversionRate: '3.2%',
    },
    trend: {
      views: [
        { date: '2024-01-15', value: 450 },
        { date: '2024-01-16', value: 520 },
        { date: '2024-01-17', value: 480 },
        { date: '2024-01-18', value: 610 },
        { date: '2024-01-19', value: 590 },
        { date: '2024-01-20', value: 720 },
        { date: '2024-01-21', value: 680 },
      ]
    },
    topPages: [
      { page: 'Home', path: '/', views: 5234, percentage: 34.3 },
      { page: 'Services', path: '/services', views: 3123, percentage: 20.5 },
      { page: 'About', path: '/about', views: 2456, percentage: 16.1 },
      { page: 'Contact', path: '/contact', views: 2234, percentage: 14.7 },
      { page: 'Blog', path: '/blog', views: 2187, percentage: 14.4 },
    ],
    traffic: {
      organic: { visits: 6234, percentage: 40.9 },
      direct: { visits: 4532, percentage: 29.7 },
      social: { visits: 2345, percentage: 15.4 },
      referral: { visits: 1234, percentage: 8.1 },
      paid: { visits: 889, percentage: 5.8 },
    },
    devices: {
      desktop: { sessions: 8234, percentage: 54 },
      mobile: { sessions: 5678, percentage: 37.2 },
      tablet: { sessions: 1322, percentage: 8.7 },
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Performance metrics for {site.businessName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Page Views"
          value={analytics.overview.totalViews.toLocaleString()}
          icon={Eye}
          description="Last 30 days"
          trend={{ value: 12.5, label: "vs last period" }}
        />
        <StatCard
          title="Unique Visitors"
          value={analytics.overview.uniqueVisitors.toLocaleString()}
          icon={Users}
          description="Last 30 days"
          trend={{ value: 8.2, label: "vs last period" }}
        />
        <StatCard
          title="Avg. Duration"
          value={analytics.overview.avgSessionDuration}
          icon={Clock}
          description="Per session"
          trend={{ value: -5.1, label: "vs last period" }}
        />
        <StatCard
          title="Bounce Rate"
          value={analytics.overview.bounceRate}
          icon={MousePointer}
          description="Last 30 days"
          trend={{ value: -2.3, label: "vs last period" }}
        />
        <StatCard
          title="Conversion"
          value={analytics.overview.conversionRate}
          icon={TrendingUp}
          description="Form submissions"
          trend={{ value: 15.7, label: "vs last period" }}
        />
      </div>

      {/* Traffic Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Traffic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Traffic chart visualization will be displayed here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{page.page}</p>
                      <p className="text-xs text-gray-500">{page.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${page.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.traffic).map(([source, data]) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-3 w-3 rounded-full ${
                      source === 'organic' ? 'bg-green-500' :
                      source === 'direct' ? 'bg-blue-500' :
                      source === 'social' ? 'bg-purple-500' :
                      source === 'referral' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="font-medium capitalize">{source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {data.percentage}%
                    </span>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {data.visits.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.devices).map(([device, data]) => (
                <div key={device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{device}</span>
                    <span className="text-sm text-gray-600">
                      {data.sessions.toLocaleString()} ({data.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Geographic data will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}