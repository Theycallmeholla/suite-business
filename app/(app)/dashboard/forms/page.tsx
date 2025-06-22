import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FormsManager from './FormsManager';

export default async function FormsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }

  // Get user's sites and forms
  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    include: {
      forms: {
        select: {
          id: true,
          name: true,
          type: true,
          enabled: true,
          createdAt: true,
          _count: {
            select: {
              submissions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Transform the data for the client component
  const sitesWithForms = sites.map(site => ({
    id: site.id,
    businessName: site.businessName,
    subdomain: site.subdomain,
    forms: site.forms.map(form => ({
      id: form.id,
      name: form.name,
      type: form.type,
      enabled: form.enabled,
      createdAt: form.createdAt,
      submissionsCount: form._count.submissions
    }))
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Lead Capture Forms</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage custom forms for your sites
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormsManager sites={sitesWithForms} />
      </div>
    </div>
  );
}
