import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  FileText, 
  Download, 
  Filter,
  Calendar,
  Mail,
  Building2,
  Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmissionsTable } from './SubmissionsTable';
import { SubmissionsFilter } from './SubmissionsFilter';

export default async function FormSubmissionsPage({
  searchParams
}: {
  searchParams: { filter?: string; days?: string }
}) {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Build where clause based on filters
  const whereClause: any = {
    form: {
      site: {
        userId: session.user.id
      }
    }
  };

  // Apply filter
  if (searchParams.filter === 'unread') {
    whereClause.isRead = false;
  }

  // Apply date filter
  if (searchParams.days) {
    const daysAgo = parseInt(searchParams.days);
    whereClause.createdAt = {
      gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    };
  }

  // Get form submissions from all user's sites
  const submissions = await prisma.formSubmission.findMany({
    where: whereClause,
    include: {
      form: {
        select: {
          name: true,
          id: true,
          site: {
            select: {
              businessName: true,
              id: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const totalSubmissions = await prisma.formSubmission.count({
    where: {
      form: {
        site: {
          userId: session.user.id
        }
      }
    }
  });

  const recentSubmissions = await prisma.formSubmission.count({
    where: {
      form: {
        site: {
          userId: session.user.id
        }
      },
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }
  });

  const unreadSubmissions = await prisma.formSubmission.count({
    where: {
      form: {
        site: {
          userId: session.user.id
        }
      },
      isRead: false
    }
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Form Submissions
            {unreadSubmissions > 0 && (
              <span className="ml-3 text-sm font-normal text-blue-600">
                ({unreadSubmissions} unread)
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all form submissions across your sites
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{totalSubmissions}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{recentSubmissions}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold">{unreadSubmissions}</p>
              </div>
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Forms</p>
                <p className="text-2xl font-bold">
                  {new Set(submissions.map(s => s.formId)).size}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <SubmissionsFilter />

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          <SubmissionsTable initialSubmissions={submissions} />
        </CardContent>
      </Card>
    </div>
  );
}