import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  UserPlus, 
  Globe, 
  BarChart3,
  Plus,
  BookOpen,
  Video,
  HelpCircle,
  Zap
} from 'lucide-react';

interface QuickAction {
  label: string;
  icon: any;
  href: string;
  description?: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Create Form',
    icon: FileText,
    href: '/dashboard/forms/new',
    description: 'Build a new contact form'
  },
  {
    label: 'Add Contact',
    icon: UserPlus,
    href: '/dashboard/crm/contacts/new',
    description: 'Add a new CRM contact'
  },
  {
    label: 'Add Domain',
    icon: Globe,
    href: '/dashboard/sites/domains',
    description: 'Connect a custom domain'
  },
  {
    label: 'View Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    description: 'See performance metrics'
  }
];

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of SiteBango',
    icon: BookOpen,
    href: '/resources/getting-started'
  },
  {
    title: 'Domain Setup Tutorial',
    description: 'Step-by-step domain configuration',
    icon: Globe,
    href: '/resources/domain-setup'
  },
  {
    title: 'SEO Best Practices',
    description: 'Optimize your sites for search',
    icon: Zap,
    href: '/resources/seo-guide'
  },
  {
    title: 'Video Tutorials',
    description: 'Watch how-to videos',
    icon: Video,
    href: '/resources/videos'
  }
];

export function QuickActions() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Quick Actions</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
                  asChild
                >
                  <Link href={action.href}>
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Resources</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {resource.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {resource.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}