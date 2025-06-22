import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ExternalLink, Settings, Plus, FileText, Plug, Users, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';
import { CreateGBPPrompt } from './components/CreateGBPPrompt';

export default async function DashboardPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get user's sites
  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (sites.length === 0) {
    redirect('/onboarding');
  }

  // Find sites that were created manually and don't have GBP
  const manualSitesWithoutGBP = sites.filter(site => 
    site.manualSetup && !site.gbpLocationId && !site.gbpCreationStatus
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {session.user.name || session.user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/forms">
                  <FileText className="h-4 w-4 mr-1" />
                  Forms
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/integrations">
                  <Plug className="h-4 w-4 mr-1" />
                  Integrations
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/crm">
                  <Users className="h-4 w-4 mr-1" />
                  CRM
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/billing">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Billing
                </Link>
              </Button>
              <SignOutButton variant="outline" />
            </div>
          </div>
        </div>

        {/* Show GBP creation prompt for manual sites */}
        {manualSitesWithoutGBP.length > 0 && (
          <div className="mb-6">
            <CreateGBPPrompt
              siteId={manualSitesWithoutGBP[0].id}
              businessName={manualSitesWithoutGBP[0].businessName}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: site.primaryColor || '#22C55E' }}
                  >
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{site.businessName}</h3>
                    <p className="text-sm text-gray-500">{site.subdomain}.{process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'suitebusiness.com'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Status: {site.published ? (
                    <span className="text-green-600 font-medium">Published</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">Draft</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(site.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button asChild size="sm" variant="outline">
                  <a 
                    href={process.env.NODE_ENV === 'development' 
                      ? `http://${site.subdomain}.localhost:3000`
                      : `https://${site.subdomain}.suitebusiness.com`
                    } 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Site
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/sites/${site.id}/settings`}>
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Link>
                </Button>
              </div>
            </Card>
          ))}

          {/* Add new site card */}
          <Card className="p-6 border-dashed border-2 flex items-center justify-center min-h-[240px]">
            <div className="text-center">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Add another business</p>
              <Button asChild variant="outline">
                <Link href="/onboarding">
                  Add Business
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}