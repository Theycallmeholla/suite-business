import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function IntegrationsPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get all sites for the user with GHL status
  const sites = await prisma.site.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      businessName: true,
      subdomain: true,
      industry: true,
      ghlLocationId: true,
      ghlEnabled: true,
      gbpLocationId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalSites = sites.length;
  const ghlConnectedSites = sites.filter(s => s.ghlLocationId).length;
  const ghlEnabledSites = sites.filter(s => s.ghlEnabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Manage your GoHighLevel CRM and other integrations
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSites}</div>
            <p className="text-xs text-muted-foreground">
              Across all industries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GHL Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ghlConnectedSites}</div>
            <p className="text-xs text-muted-foreground">
              {totalSites > 0 ? Math.round((ghlConnectedSites / totalSites) * 100) : 0}% of sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Sync Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ghlEnabledSites}</div>
            <p className="text-xs text-muted-foreground">
              Actively syncing leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GoHighLevel Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>GoHighLevel CRM</CardTitle>
              <CardDescription className="mt-2">
                Automatically sync leads from your websites to GoHighLevel for advanced CRM features,
                automated follow-ups, and sales pipelines.
              </CardDescription>
            </div>
            <a
              href="https://www.gohighlevel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Learn More
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sites.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No sites created yet. Create a site to enable GoHighLevel integration.
              </p>
            ) : (
              <div className="space-y-3">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        {site.ghlLocationId ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{site.businessName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {site.subdomain}.{new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000').hostname}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {site.industry}
                        </Badge>
                        {site.ghlLocationId && (
                          <Badge 
                            variant={site.ghlEnabled ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {site.ghlEnabled ? 'Active' : 'Paused'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/preview/${site.id}`}>
                          Preview & Settings
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Future Integrations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Coming Soon</Badge>
              Stripe Billing
            </CardTitle>
            <CardDescription>
              Accept payments and manage subscriptions directly from your sites
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Coming Soon</Badge>
              Email Marketing
            </CardTitle>
            <CardDescription>
              Send automated emails and newsletters to your leads
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
