import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Building2, ExternalLink, Settings, BarChart, Eye, Globe, Shield } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SiteCardProps {
  site: {
    id: string;
    businessName: string;
    subdomain: string;
    customDomain?: string | null;
    published: boolean;
    primaryColor?: string | null;
    createdAt: Date;
    updatedAt: Date;
    logo?: string | null;
    gbpLocationId?: string | null;
  };
  analytics?: {
    views: number;
    leads: number;
  };
}

export function SiteCard({ site, analytics }: SiteCardProps) {
  const domain = site.customDomain || `${site.subdomain}.${process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'suitebusiness.com'}`;
  const siteUrl = process.env.NODE_ENV === 'development' 
    ? `http://${domain}`
    : `https://${domain}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center",
                site.logo ? "bg-gray-100" : ""
              )}
              style={{ 
                backgroundColor: !site.logo ? (site.primaryColor || '#22C55E') : undefined 
              }}
            >
              {site.logo ? (
                <img 
                  src={site.logo} 
                  alt={site.businessName} 
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <Building2 className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{site.businessName}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {domain}
              </p>
            </div>
          </div>
          <Badge 
            variant={site.published ? "default" : "secondary"}
            className={cn(
              site.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            )}
          >
            {site.published ? "Published" : "Draft"}
          </Badge>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Eye className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-2xl font-semibold">{analytics.views.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Views this month</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <BarChart className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <p className="text-2xl font-semibold">{analytics.leads}</p>
              <p className="text-xs text-gray-500">Leads</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-1 text-sm text-gray-600">
          <p>Last updated: {formatDistanceToNow(new Date(site.updatedAt), { addSuffix: true })}</p>
          {site.gbpLocationId && (
            <p className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Google Business Profile connected
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-3 bg-gray-50 border-t">
        <div className="flex gap-2 w-full">
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Site
            </a>
          </Button>
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/dashboard/sites/${site.id}`}>
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/dashboard/sites/${site.id}/analytics`}>
              <BarChart className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}