import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SiteNavigation } from '@/components/dashboard/SiteNavigation';

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get the site to verify ownership and get the business name
  const site = await prisma.site.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!site) {
    redirect('/dashboard/sites');
  }

  return (
    <>
      <SiteNavigation businessName={site.businessName} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </>
  );
}