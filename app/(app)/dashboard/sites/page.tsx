import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteCard } from '@/components/dashboard/SiteCard';

export default async function SitesPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get user's sites
  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-gray-600 mt-2">
            Manage all your business websites in one place
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding">
            <Plus className="h-4 w-4 mr-2" />
            Add New Site
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search sites..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No sites yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first business website</p>
          <Button asChild>
            <Link href="/onboarding">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Site
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <SiteCard 
              key={site.id} 
              site={site}
              analytics={{
                views: Math.floor(Math.random() * 5000), // Replace with real data
                leads: Math.floor(Math.random() * 50), // Replace with real data
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}