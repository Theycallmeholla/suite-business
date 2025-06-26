import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  MoreVertical,
  UserPlus,
  Settings,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default async function TeamSettingsPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Mock team data - in a real app, you'd have a team/organization structure
  const teamMembers = [
    {
      id: '1',
      name: session.user.name || 'Current User',
      email: session.user.email!,
      image: session.user.image,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      image: null,
      role: 'admin',
      status: 'active',
      joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      image: null,
      role: 'editor',
      status: 'invited',
      joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      owner: { label: 'Owner', className: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Admin', className: 'bg-blue-100 text-blue-800' },
      editor: { label: 'Editor', className: 'bg-green-100 text-green-800' },
      viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.viewer;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      invited: { label: 'Invited', className: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your team members and their permissions
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.status === 'invited').length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            View and manage team members who have access to your sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => {
                const initials = member.name
                  ? member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : member.email[0].toUpperCase();

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.image || undefined} alt={member.name} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-gray-600">
                      {member.joinedAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {member.role !== 'owner' && (
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite New Member */}
      <Card>
        <CardHeader>
          <CardTitle>Invite New Member</CardTitle>
          <CardDescription>
            Send an invitation to add a new team member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input 
                  id="invite-email" 
                  type="email" 
                  placeholder="colleague@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select defaultValue="editor">
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access except billing</SelectItem>
                    <SelectItem value="editor">Editor - Can edit sites and content</SelectItem>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Send Invitation</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding different roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getRoleBadge('owner')}
                <p className="font-medium">Owner</p>
              </div>
              <p className="text-sm text-gray-600">
                Full access to all features including billing, team management, and account deletion
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getRoleBadge('admin')}
                <p className="font-medium">Admin</p>
              </div>
              <p className="text-sm text-gray-600">
                Can manage sites, forms, analytics, and team members. Cannot access billing or delete account
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getRoleBadge('editor')}
                <p className="font-medium">Editor</p>
              </div>
              <p className="text-sm text-gray-600">
                Can create and edit sites, manage content, and view analytics. Cannot manage team
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getRoleBadge('viewer')}
                <p className="font-medium">Viewer</p>
              </div>
              <p className="text-sm text-gray-600">
                Read-only access to view sites and analytics. Cannot make any changes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}