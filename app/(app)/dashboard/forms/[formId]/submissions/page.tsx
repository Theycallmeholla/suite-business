import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SubmissionsViewer from './SubmissionsViewer';

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }

  const { formId } = await params;

  // Get form with submissions
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      site: {
        userId: session.user.id
      }
    },
    include: {
      site: {
        select: {
          businessName: true,
          subdomain: true,
        }
      },
      submissions: {
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to recent 100 submissions
      }
    }
  });

  if (!form) {
    redirect('/dashboard/forms');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {form.name} Submissions
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {form.site.businessName} • {form.submissions.length} submissions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubmissionsViewer 
          form={form}
          submissions={form.submissions}
        />
      </div>
    </div>
  );
}
