import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  User, 
  Globe, 
  Shield, 
  Mail,
  Activity,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'form_submission' | 'site_published' | 'contact_added' | 'domain_verified' | 'lead_created';
  title: string;
  description?: string;
  timestamp: Date;
  link?: string;
  siteName?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

const activityIcons = {
  form_submission: FileText,
  site_published: Globe,
  contact_added: User,
  domain_verified: Shield,
  lead_created: Mail,
};

const activityColors = {
  form_submission: 'text-blue-600 bg-blue-100',
  site_published: 'text-green-600 bg-green-100',
  contact_added: 'text-purple-600 bg-purple-100',
  domain_verified: 'text-yellow-600 bg-yellow-100',
  lead_created: 'text-pink-600 bg-pink-100',
};

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/activity">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">
              Activity will appear here when you start using your sites
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    colorClass
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                      {activity.siteName && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500">{activity.siteName}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {activity.link && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-shrink-0"
                      asChild
                    >
                      <Link href={activity.link}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}