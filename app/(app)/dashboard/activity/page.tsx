import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { 
  Activity,
  Filter,
  FileText, 
  User, 
  Globe, 
  Shield, 
  Mail,
  Settings,
  Edit,
  Trash2,
  Plus,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default async function ActivityPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Mock activity data - in a real app, this would come from an activity log
  const activities = [
    {
      id: '1',
      type: 'form_submission',
      title: 'New form submission',
      description: 'Contact form submission from John Doe',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      site: { id: 'site1', name: 'Main Business' },
      user: session.user.name || session.user.email,
      metadata: { formName: 'Contact Form', submissionId: 'sub123' }
    },
    {
      id: '2',
      type: 'site_updated',
      title: 'Site updated',
      description: 'Homepage content was modified',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      site: { id: 'site1', name: 'Main Business' },
      user: session.user.name || session.user.email,
      metadata: { page: 'Home' }
    },
    {
      id: '3',
      type: 'contact_added',
      title: 'New contact added',
      description: 'Sarah Johnson added to CRM',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      site: { id: 'site2', name: 'Secondary Business' },
      user: 'Sarah Admin',
      metadata: { contactName: 'Sarah Johnson', contactEmail: 'sarah@example.com' }
    },
    {
      id: '4',
      type: 'site_published',
      title: 'Site published',
      description: 'Site changes are now live',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      site: { id: 'site1', name: 'Main Business' },
      user: session.user.name || session.user.email,
      metadata: {}
    },
    {
      id: '5',
      type: 'form_created',
      title: 'Form created',
      description: 'Newsletter signup form was created',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      site: { id: 'site2', name: 'Secondary Business' },
      user: session.user.name || session.user.email,
      metadata: { formName: 'Newsletter Signup' }
    },
    {
      id: '6',
      type: 'settings_updated',
      title: 'Settings updated',
      description: 'Site SEO settings were modified',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      site: { id: 'site1', name: 'Main Business' },
      user: session.user.name || session.user.email,
      metadata: { settingType: 'SEO' }
    },
  ];

  const getActivityIcon = (type: string) => {
    const icons = {
      form_submission: FileText,
      form_created: Plus,
      site_published: Globe,
      site_updated: Edit,
      contact_added: User,
      contact_deleted: Trash2,
      domain_verified: Shield,
      settings_updated: Settings,
      lead_created: Mail,
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      form_submission: 'text-blue-600 bg-blue-100',
      form_created: 'text-green-600 bg-green-100',
      site_published: 'text-purple-600 bg-purple-100',
      site_updated: 'text-yellow-600 bg-yellow-100',
      contact_added: 'text-pink-600 bg-pink-100',
      contact_deleted: 'text-red-600 bg-red-100',
      domain_verified: 'text-indigo-600 bg-indigo-100',
      settings_updated: 'text-gray-600 bg-gray-100',
      lead_created: 'text-orange-600 bg-orange-100',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp);
    const dateKey = date.toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
    return groups;
  }, {} as Record<string, typeof activities>);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-gray-600 mt-2">
            Track all activities across your sites
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              <SelectItem value="site1">Main Business</SelectItem>
              <SelectItem value="site2">Secondary Business</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="forms">Forms</SelectItem>
              <SelectItem value="sites">Sites</SelectItem>
              <SelectItem value="contacts">Contacts</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([date, dayActivities]) => {
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
          
          let dateLabel = date;
          if (date === today) dateLabel = 'Today';
          else if (date === yesterday) dateLabel = 'Yesterday';
          else dateLabel = new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });

          return (
            <div key={date}>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {dateLabel}
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                {dayActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.type);
                  
                  return (
                    <Card key={activity.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-medium">{activity.title}</h3>
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>{activity.timestamp.toLocaleTimeString()}</span>
                                  <span>•</span>
                                  <Link 
                                    href={`/dashboard/sites/${activity.site.id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {activity.site.name}
                                  </Link>
                                  <span>•</span>
                                  <span>by {activity.user}</span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <Button variant="outline">
          Load More Activities
        </Button>
      </div>
    </div>
  );
}