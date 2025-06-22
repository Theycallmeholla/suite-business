import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { ContactsList, PipelineView, CommunicationHub } from '@/components/crm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function SiteCRMPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const site = await prisma.site.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      businessName: true,
      ghlEnabled: true,
      ghlApiKey: true,
      ghlLocationId: true,
    },
  });

  if (!site) {
    notFound();
  }

  const hasGHLCredentials = site.ghlApiKey && site.ghlLocationId;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Link 
          href={`/dashboard/sites/${site.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Site Dashboard
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Manage contacts, deals, and communications for {site.businessName}
          </p>
        </div>
      </div>

      {!site.ghlEnabled || !hasGHLCredentials ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              GoHighLevel Integration Required
            </CardTitle>
            <CardDescription>
              CRM features require GoHighLevel integration to be configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                To use CRM features, you need to complete the GoHighLevel setup for this site.
                This will create a sub-account and enable contact management, pipeline tracking,
                and communication features.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href={`/dashboard/sites/${site.id}/settings`}>
                    Configure Integration
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/integrations">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="contacts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <Suspense fallback={<div>Loading contacts...</div>}>
              <ContactsList siteId={site.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <Suspense fallback={<div>Loading pipeline...</div>}>
              <PipelineView siteId={site.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <Suspense fallback={<div>Loading communications...</div>}>
              <CommunicationHub siteId={site.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="text-muted-foreground">
              Calendar view coming soon...
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}