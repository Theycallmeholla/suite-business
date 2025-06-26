import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Plus, Edit, Trash2, Eye, FileText,
  Home, Info, Phone, Settings
} from 'lucide-react';
import Link from 'next/link';
import { CreatePageButton } from './CreatePageButton';

export default async function SitePagesPage({ params }: { params: Promise<{ id: string }> }) {
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
    include: {
      pages: {
        orderBy: { createdAt: 'asc' },
      },
      services: true,
    },
  });

  if (!site) {
    notFound();
  }

  const pageTypes = [
    { type: 'home', label: 'Home Page', icon: Home, description: 'Main landing page' },
    { type: 'about', label: 'About Page', icon: Info, description: 'About your business' },
    { type: 'services', label: 'Services Page', icon: Settings, description: 'List of services' },
    { type: 'contact', label: 'Contact Page', icon: Phone, description: 'Contact information' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link 
          href={`/dashboard/sites/${site.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Site Dashboard
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pages</h1>
            <p className="text-gray-600 mt-1">
              Manage your site's pages and content
            </p>
          </div>
          <Button asChild>
            <Link href={`/preview/${site.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview & Edit
            </Link>
          </Button>
        </div>
      </div>

      {site.pages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first page to get started
            </p>
            <Button asChild>
              <Link href={`/preview/${site.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Home Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pageTypes.map((pageType) => {
            const page = site.pages.find(p => p.type === pageType.type);
            const Icon = pageType.icon;
            
            return (
              <Card key={pageType.type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pageType.label}</CardTitle>
                        <CardDescription>{pageType.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {page ? (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/preview/${site.id}?pageId=${page.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <CreatePageButton 
                          siteId={site.id} 
                          pageType={pageType.type}
                          siteData={site}
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {page && page.content && (
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <p>Last updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
                      {page.content && typeof page.content === 'object' && 'sections' in page.content && Array.isArray(page.content.sections) && (
                        <p>{page.content.sections.length} sections</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Pro Tip</h3>
        <p className="text-blue-800">
          Use the Preview & Edit mode to make real-time changes to your pages. 
          Click the "Edit Content" button in the preview bar to enable inline editing.
        </p>
      </div>
    </div>
  );
}