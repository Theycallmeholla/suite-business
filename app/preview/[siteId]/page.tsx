import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDefaultSections } from '@/lib/site-builder';
import { PreviewBar } from './PreviewBar';
import PreviewContent from './PreviewContent';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { ViewportProvider } from '@/contexts/ViewportContext';
import { ViewportWrapper } from './ViewportWrapper';

export default async function PreviewPage({
  params
}: {
  params: Promise<{ siteId: string }>;
}) {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const { siteId } = await params;

  // Get the site and verify ownership
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId: session.user.id,
    },
    include: {
      pages: true,
      services: true,
      photos: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  // Get page content - either from database or generate default
  let sections: any[] = [];
  
  // Check if we have custom page content
  const homePage = site.pages.find(p => p.type === 'home');
  if (homePage && homePage.content && typeof homePage.content === 'object' && 'sections' in homePage.content) {
    sections = (homePage.content as any).sections || [];
  } else {
    // Generate default sections based on available data
    sections = generateDefaultSections(site);
  }

  return (
    <ViewportProvider>
      <EditModeProvider>
        <div>
          {/* Preview Bar - Fixed at top */}
          <PreviewBar site={site} />

          {/* Site Preview */}
          <div className="pt-16"> {/* Space for preview bar */}
            <ViewportWrapper>
              <PreviewContent 
                site={site} 
                initialSections={sections}
                pageId={homePage?.id}
              />
            </ViewportWrapper>
          </div>
        </div>
      </EditModeProvider>
    </ViewportProvider>
  );
}
