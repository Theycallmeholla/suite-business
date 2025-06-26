/**
 * Basic Analytics Dashboard
 * 
 * Uses existing database data to provide immediate insights
 * without requiring complex analytics setup.
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Star,
  Clock,
  Target
} from 'lucide-react';

interface AnalyticsData {
  totalLeads: number;
  leadsThisMonth: number;
  leadsGrowth: number;
  totalViews: number;
  viewsThisMonth: number;
  viewsGrowth: number;
  conversionRate: number;
  avgResponseTime: number;
  topSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    source: string;
    createdAt: Date;
  }>;
  monthlyData: Array<{
    month: string;
    leads: number;
    views: number;
  }>;
}

interface BasicAnalyticsDashboardProps {
  siteId: string;
  businessName: string;
  className?: string;
}

export function BasicAnalyticsDashboard({ 
  siteId, 
  businessName, 
  className = '' 
}: BasicAnalyticsDashboardProps) {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d'>('30d');

  React.useEffect(() => {
    fetchAnalyticsData();
  }, [siteId, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/basic?siteId=${siteId}&range=${timeRange}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-gray-600">No analytics data available yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          Data will appear once your website starts receiving visitors.
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-gray-600">{businessName}</p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={data.totalLeads}
          change={data.leadsGrowth}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        
        <MetricCard
          title="Website Views"
          value={data.totalViews}
          change={data.viewsGrowth}
          icon={<Eye className="h-5 w-5" />}
          color="green"
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${data.conversionRate.toFixed(1)}%`}
          icon={<Target className="h-5 w-5" />}
          color="purple"
        />
        
        <MetricCard
          title="Avg Response Time"
          value={`${data.avgResponseTime}h`}
          icon={<Clock className="h-5 w-5" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lead Sources
          </h3>
          
          <div className="space-y-3">
            {data.topSources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getSourceColor(source.source)}`} />
                  <span className="text-sm font-medium">{source.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{source.count}</span>
                  <Badge variant="outline" className="text-xs">
                    {source.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Leads */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Leads
          </h3>
          
          <div className="space-y-3">
            {data.recentLeads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{lead.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span>{lead.email}</span>
                    {lead.phone && (
                      <>
                        <Phone className="h-3 w-3 ml-2" />
                        <span>{lead.phone}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs mb-1">
                    {lead.source}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(lead.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {data.recentLeads.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No leads yet. Keep promoting your website!
            </p>
          )}
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Monthly Trends
        </h3>
        
        <div className="space-y-4">
          {data.monthlyData.map((month, index) => (
            <div key={month.month} className="flex items-center justify-between">
              <span className="text-sm font-medium">{month.month}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-600">{month.leads} leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">{month.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="h-5 w-5 text-blue-500 mb-2" />
            <p className="font-medium text-sm">Email All Leads</p>
            <p className="text-xs text-gray-600">Send follow-up emails</p>
          </button>
          
          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-5 w-5 text-green-500 mb-2" />
            <p className="font-medium text-sm">Schedule Follow-ups</p>
            <p className="text-xs text-gray-600">Set reminders for leads</p>
          </button>
          
          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <Star className="h-5 w-5 text-yellow-500 mb-2" />
            <p className="font-medium text-sm">Request Reviews</p>
            <p className="text-xs text-gray-600">Ask satisfied customers</p>
          </button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Metric card component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`h-3 w-3 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

/**
 * Helper functions
 */
function getSourceColor(source: string): string {
  const colors = {
    'Website': 'bg-blue-500',
    'Google': 'bg-green-500',
    'Facebook': 'bg-blue-600',
    'Referral': 'bg-purple-500',
    'Direct': 'bg-gray-500',
  };
  
  return colors[source as keyof typeof colors] || 'bg-gray-400';
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}