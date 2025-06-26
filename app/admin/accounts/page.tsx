import { requireAgencyAccess } from '@/lib/auth-helpers';
import { getUserContext } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { rootDomain } from '@/lib/utils';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Trash2, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: `Sub-Accounts | ${rootDomain}`,
  description: `Manage sub-accounts for ${rootDomain}`
};

export default async function AccountsPage() {
  // Require agency access
  const session = await requireAgencyAccess();
  const userContext = await getUserContext(session.user.id);

  // Get all sites with their associated users
  const sites = await prisma.site.findMany({
    include: {
      user: true,
      forms: {
        select: {
          id: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="font-bold text-lg">SiteBango Agency</h2>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/admin/accounts" className="text-sm font-medium text-blue-600">
                Sub-Accounts
              </Link>
              <Link href="/admin/team" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Team
              </Link>
              <Link href="/admin/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.name || session.user.email}
            </span>
            <SignOutButton variant="ghost" size="sm" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sub-Accounts</h1>
          <p className="text-gray-600 mt-2">Manage all client sites and sub-accounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Sites</CardTitle>
            <CardDescription>
              All client sites created on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.businessName}</TableCell>
                    <TableCell>{site.user.name || site.user.email}</TableCell>
                    <TableCell>
                      <Link 
                        href={`http://${site.subdomain}.${rootDomain}`}
                        target="_blank"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {site.subdomain}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize">{site.industry}</TableCell>
                    <TableCell>
                      {site.published ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>{site.forms.length}</TableCell>
                    <TableCell>{new Date(site.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/accounts/${site.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/accounts/${site.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {userContext.agencyRole !== 'member' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {sites.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sites created yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}