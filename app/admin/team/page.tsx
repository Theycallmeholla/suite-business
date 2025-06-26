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
import { InviteTeamMemberDialog } from '@/components/admin/InviteTeamMemberDialog';
import { UserPlus, Edit, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: `Team Management | ${rootDomain}`,
  description: `Manage team members for ${rootDomain}`
};

export default async function TeamPage() {
  // Require agency access
  const session = await requireAgencyAccess();
  const userContext = await getUserContext(session.user.id);

  // Get agency team members
  const agencyTeam = await prisma.team.findFirst({
    where: { type: 'agency' },
    include: {
      members: {
        include: {
          user: true
        },
        orderBy: { 
          createdAt: 'asc' 
        }
      }
    }
  });

  const canManageTeam = userContext.agencyRole === 'owner' || userContext.agencyRole === 'admin';

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
              <Link href="/admin/accounts" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Sub-Accounts
              </Link>
              <Link href="/admin/team" className="text-sm font-medium text-blue-600">
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage your agency team members and permissions</p>
          </div>
          {canManageTeam && (
            <InviteTeamMemberDialog />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              All members who have access to the agency dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManageTeam && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencyTeam?.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.user.name || 'Unnamed'}
                    </TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={member.role === 'owner' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                    {canManageTeam && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {member.userId !== session.user.id && member.role !== 'owner' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!agencyTeam || agencyTeam.members.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No team members yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Understanding team member capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Owner</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Full system access. Can manage all sites, team members, billing, and settings.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Admin</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Can manage sites, view financials, and invite team members. Cannot change billing or delete the agency.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Member</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Read-only access. Can view sites and reports but cannot make changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}