import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Target, DollarSign, Flame, ThermometerSun, Snowflake } from 'lucide-react';

interface LeadStatsProps {
  sites: { id: string; businessName: string; subdomain: string }[];
}

export default async function LeadStats({ sites }: LeadStatsProps) {
  // Get site IDs
  const siteIds = sites.map(s => s.id);
  
  // Calculate date for "this week"
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get lead statistics
  const [totalLeads, newLeads, qualifiedLeads, hotLeads, warmLeads, coldLeads] = await Promise.all([
    // Total leads
    prisma.lead.count({
      where: { siteId: { in: siteIds } },
    }),
    // New leads this week
    prisma.lead.count({
      where: {
        siteId: { in: siteIds },
        createdAt: { gte: startOfWeek },
      },
    }),
    // Qualified leads
    prisma.lead.count({
      where: {
        siteId: { in: siteIds },
        status: 'qualified',
      },
    }),
    // Hot leads
    prisma.lead.count({
      where: {
        siteId: { in: siteIds },
        temperature: 'hot',
      },
    }),
    // Warm leads
    prisma.lead.count({
      where: {
        siteId: { in: siteIds },
        temperature: 'warm',
      },
    }),
    // Cold leads
    prisma.lead.count({
      where: {
        siteId: { in: siteIds },
        temperature: 'cold',
      },
    }),
  ]);

  // Calculate total pipeline value
  const leadsWithValue = await prisma.lead.findMany({
    where: {
      siteId: { in: siteIds },
      converted: false,
      dealValue: { not: null },
    },
    select: { dealValue: true },
  });

  const totalValue = leadsWithValue.reduce((sum, lead) => sum + (lead.dealValue || 0), 0);

  const stats = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'New This Week',
      value: newLeads,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Qualified',
      value: qualifiedLeads,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Pipeline Value',
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const temperatureStats = [
    {
      label: 'Hot',
      value: hotLeads,
      icon: Flame,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Warm',
      value: warmLeads,
      icon: ThermometerSun,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Cold',
      value: coldLeads,
      icon: Snowflake,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Temperature Stats */}
      <div className="grid grid-cols-3 gap-4">
        {temperatureStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label} Leads</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}