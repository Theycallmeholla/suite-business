import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Globe, ExternalLink, Settings, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default async function SitesPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const sites = await prisma.site.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Sites</h1>
            <p className="text-gray-600 mt-1">
              Manage all your business websites
            </p>
          </div>
          <Button asChild>
            <Link href="/onboarding">
              <Plus className="h-4 w-4 mr-2" />
              Add New Site
            </Link>
          </Button>
        </div>
      </div>

      {sites.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No sites yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first site to get started
          </p>
          <Button asChild>
            <Link href="/onboarding">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Site
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">{site.businessName}</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`http://${site.subdomain}.localhost:3000`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/sites/${site.id}`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  {site.subdomain}.localhost:3000
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="capitalize">{site.industry}</span>
                </div>
                
                {site.phone && (
                  <div className="text-sm text-gray-600">
                    {site.phone}
                  </div>
                )}
                
                {site.city && site.state && (
                  <div className="text-sm text-gray-600">
                    {site.city}, {site.state}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className={`text-sm px-2 py-1 rounded ${
                  site.published 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {site.published ? 'Published' : 'Draft'}
                </span>
                
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/sites/${site.id}`}>
                    Manage Site
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
