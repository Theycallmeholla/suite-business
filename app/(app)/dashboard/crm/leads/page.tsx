import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import LeadsTable from './LeadsTable';
import LeadStats from './LeadStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';
import Link from 'next/link';

export default async function LeadsPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get user's sites and teams
  const sites = await prisma.site.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        {
          team: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      businessName: true,
      subdomain: true,
    },
  });

  if (sites.length === 0) {
    redirect('/dashboard/sites');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-600 mt-1">Manage and track your business leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/crm/leads/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* Lead Statistics */}
      <Suspense fallback={<LeadStatsLoading />}>
        <LeadStats sites={sites} />
      </Suspense>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LeadsTableLoading />}>
            <LeadsTable sites={sites} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function LeadStatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LeadsTableLoading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  );
}