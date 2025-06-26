'use client';

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Globe, Activity, Target } from 'lucide-react';

interface TrafficData {
  date: string;
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
}

interface DeviceData {
  name: string;
  value: number;
  percentage: number;
}

interface ConversionData {
  source: string;
  leads: number;
  conversions: number;
  rate: number;
}

// Mock data - replace with real data from API
const trafficData: TrafficData[] = [
  { date: 'Jan 1', visits: 1234, uniqueVisitors: 892, pageViews: 3456 },
  { date: 'Jan 7', visits: 1456, uniqueVisitors: 1023, pageViews: 4123 },
  { date: 'Jan 14', visits: 1678, uniqueVisitors: 1234, pageViews: 4890 },
  { date: 'Jan 21', visits: 1890, uniqueVisitors: 1345, pageViews: 5234 },
  { date: 'Jan 28', visits: 2012, uniqueVisitors: 1456, pageViews: 5678 },
  { date: 'Feb 4', visits: 2234, uniqueVisitors: 1567, pageViews: 6123 },
  { date: 'Feb 11', visits: 2345, uniqueVisitors: 1678, pageViews: 6789 },
];

const deviceData: DeviceData[] = [
  { name: 'Desktop', value: 12543, percentage: 55 },
  { name: 'Mobile', value: 8234, percentage: 36 },
  { name: 'Tablet', value: 2056, percentage: 9 },
];

const conversionData: ConversionData[] = [
  { source: 'Organic Search', leads: 234, conversions: 45, rate: 19.2 },
  { source: 'Direct Traffic', leads: 156, conversions: 32, rate: 20.5 },
  { source: 'Social Media', leads: 123, conversions: 18, rate: 14.6 },
  { source: 'Referral', leads: 89, conversions: 12, rate: 13.5 },
  { source: 'Email', leads: 67, conversions: 15, rate: 22.4 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function TrafficChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Traffic Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trafficData}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="visits" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorVisits)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="uniqueVisitors" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorUniqueVisitors)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DeviceBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Device Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={deviceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name} ${entry.percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {deviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 mt-4">
          {deviceData.map((device, index) => (
            <div key={device.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{device.name}</span>
              </div>
              <span className="text-sm font-medium">{device.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversionFunnel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conversionData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis type="number" className="text-xs" tick={{ fill: '#6b7280' }} />
            <YAxis dataKey="source" type="category" className="text-xs" tick={{ fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Legend />
            <Bar dataKey="leads" fill="#3b82f6" />
            <Bar dataKey="conversions" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EngagementMetrics() {
  const engagementData = [
    { metric: 'Avg. Session Duration', value: '3m 45s', change: '+12%' },
    { metric: 'Pages per Session', value: '4.2', change: '+8%' },
    { metric: 'Bounce Rate', value: '42%', change: '-5%' },
    { metric: 'New vs Returning', value: '65% / 35%', change: '+3%' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Engagement Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {engagementData.map((item) => (
            <div key={item.metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{item.metric}</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{item.value}</span>
                <span className={`text-sm ${
                  item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}