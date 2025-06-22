// app/dashboard/crm/page.tsx
// Custom CRM Interface using GoHighLevel as backend

import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function CRMDashboard() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get user's sites that have GHL enabled
  const sites = await prisma.site.findMany({
    where: {
      userId: session.user.id,
      ghlEnabled: true,
    },
    select: {
      id: true,
      businessName: true,
      subdomain: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // If only one site with GHL, redirect to it
  if (sites.length === 1) {
    redirect(`/dashboard/sites/${sites[0].id}/crm`);
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <p className="text-muted-foreground">
          Select a business to manage its CRM
        </p>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No CRM-Enabled Sites</CardTitle>
            <CardDescription>
              You don't have any sites with GoHighLevel CRM integration enabled yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Enable GoHighLevel integration for your sites to access CRM features including
              contact management, pipeline tracking, and automated communications.
            </p>
            <Button asChild>
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{site.businessName}</CardTitle>
                    <CardDescription>{site.subdomain}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/sites/${site.id}/crm`}>
                    Open CRM
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
