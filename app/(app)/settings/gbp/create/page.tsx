import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateGBPForm } from './CreateGBPForm';

interface CreateGBPPageProps {
  searchParams: {
    siteId?: string;
  };
}

export default async function CreateGBPPage({ searchParams }: CreateGBPPageProps) {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const siteId = searchParams.siteId;
  
  if (!siteId) {
    redirect('/dashboard');
  }

  // Get the site
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId: session.user.id,
    },
  });

  if (!site) {
    redirect('/dashboard');
  }

  // Check if site already has GBP
  if (site.gbpLocationId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <CreateGBPForm site={site} />
      </div>
    </div>
  );
}