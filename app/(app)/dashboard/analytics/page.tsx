import { redirect } from 'next/navigation';
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
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard } from '@/components/dashboard/QuickStats';
import { TrafficChart, DeviceBreakdown, ConversionFunnel, EngagementMetrics } from '@/components/analytics/AnalyticsCharts';

export default async function AnalyticsPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get user's sites for the filter
  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    select: { id: true, businessName: true },
    orderBy: { createdAt: 'desc' },
  });

  // Mock analytics data - replace with real analytics
  const analytics = {
    totalViews: 45234,
    uniqueVisitors: 12543,
    avgSessionDuration: '3m 45s',
    bounceRate: '42%',
    topPages: [
      { page: 'Home', views: 15234, percentage: 33.6 },
      { page: 'Services', views: 8932, percentage: 19.7 },
      { page: 'Contact', views: 6234, percentage: 13.8 },
      { page: 'About', views: 5123, percentage: 11.3 },
      { page: 'Blog', views: 4234, percentage: 9.4 },
    ],
    topReferrers: [
      { source: 'Google', visits: 8234, percentage: 65.6 },
      { source: 'Direct', visits: 2345, percentage: 18.7 },
      { source: 'Facebook', visits: 1234, percentage: 9.8 },
      { source: 'Twitter', visits: 432, percentage: 3.4 },
      { source: 'LinkedIn', visits: 312, percentage: 2.5 },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track performance across all your sites
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Page Views"
          value={analytics.totalViews.toLocaleString()}
          icon={Eye}
          description="Last 30 days"
          trend={{ value: 12.5, label: "vs previous period" }}
        />
        <StatCard
          title="Unique Visitors"
          value={analytics.uniqueVisitors.toLocaleString()}
          icon={Users}
          description="Last 30 days"
          trend={{ value: 8.2, label: "vs previous period" }}
        />
        <StatCard
          title="Avg. Session Duration"
          value={analytics.avgSessionDuration}
          icon={Clock}
          description="Last 30 days"
          trend={{ value: -5.1, label: "vs previous period" }}
        />
        <StatCard
          title="Bounce Rate"
          value={analytics.bounceRate}
          icon={MousePointer}
          description="Last 30 days"
          trend={{ value: -2.3, label: "vs previous period" }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChart />
        <DeviceBreakdown />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnel />
        <EngagementMetrics />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topPages.map((page, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}.</TableCell>
                    <TableCell className="font-medium">{page.page}</TableCell>
                    <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{page.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topReferrers.map((referrer, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}.</TableCell>
                    <TableCell className="font-medium">{referrer.source}</TableCell>
                    <TableCell className="text-right">{referrer.visits.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{referrer.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}