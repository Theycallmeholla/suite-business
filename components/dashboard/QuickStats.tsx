import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className 
}: StatCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.value > 0 ? "text-green-600" : "text-red-600"
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
    </Card>
  );
}

interface QuickStatsProps {
  stats: {
    totalSites: number;
    activeLeads: number;
    formSubmissions: number;
    monthlyViews: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Sites"
        value={stats.totalSites}
        icon={Building2}
        description="Active websites"
      />
      <StatCard
        title="Active Leads"
        value={stats.activeLeads}
        icon={Users}
        description="This month"
        trend={{ value: 12, label: "from last month" }}
      />
      <StatCard
        title="Form Submissions"
        value={stats.formSubmissions}
        icon={FileText}
        description="Last 30 days"
      />
      <StatCard
        title="Monthly Views"
        value={stats.monthlyViews.toLocaleString()}
        icon={Eye}
        description="All sites combined"
        trend={{ value: 8, label: "from last month" }}
      />
    </div>
  );
}

// Import the icons we need
import { Building2, Users, FileText, Eye } from 'lucide-react';