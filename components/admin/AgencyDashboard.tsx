'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Settings, 
  Shield,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Globe,
  TrendingUp,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteTeamMemberDialog } from './InviteTeamMemberDialog';

interface AgencyDashboardProps {
  stats: {
    totalSites: number;
    totalUsers: number;
    publishedSites: number;
    monthlyRevenue: number;
    totalLeads: number;
  };
  sites: any[];
  teamMembers: any[];
  userRole: string;
  currentUserId: string;
}

export function AgencyDashboard({ stats, sites, teamMembers, userRole, currentUserId }: AgencyDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && site.published) ||
                         (filterStatus === 'draft' && !site.published);
    return matchesSearch && matchesStatus;
  });

  // Permission checks
  const canEditTeam = userRole === 'owner' || userRole === 'admin';
  const canViewFinancials = userRole === 'owner' || userRole === 'admin';
  const canManageBusinesses = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Businesses</p>
              <p className="text-3xl font-bold">{stats.totalSites}</p>
              <p className="text-xs text-gray-500">{stats.publishedSites} active</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500">Across all businesses</p>
            </div>
          </Card>

          {canViewFinancials && (
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+15% from last month</p>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold">{stats.totalLeads}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="businesses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="team">Agency Team</TabsTrigger>
          {canViewFinancials && <TabsTrigger value="billing">Billing</TabsTrigger>}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Businesses Tab */}
        <TabsContent value="businesses" className="space-y-4">
          <Card className="p-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Active</option>
                <option value="draft">Setup</option>
              </select>
            </div>

            {/* Businesses List */}
            <div className="space-y-4">
              {filteredSites.map((site) => (
                <div key={site.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{site.businessName}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          site.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {site.published ? 'Active' : 'Setup'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Owner</p>
                          <p className="font-medium">{site.user.name || site.user.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Industry</p>
                          <p className="font-medium capitalize">{site.industry}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p className="font-medium">{new Date(site.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <a href={`https://${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} 
                           target="_blank" 
                           className="flex items-center gap-1 hover:text-blue-600">
                          <Globe className="h-4 w-4" />
                          Visit Site
                        </a>
                        {site.email && (
                          <a href={`mailto:${site.email}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Mail className="h-4 w-4" />
                            {site.email}
                          </a>
                        )}
                        {site.phone && (
                          <a href={`tel:${site.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Phone className="h-4 w-4" />
                            {site.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/businesses/${site.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {canManageBusinesses && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/businesses/${site.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Business
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Suspend Business
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Agency Team Members</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your agency team and their permissions</p>
              </div>
              {canEditTeam && (
                <InviteTeamMemberDialog />
              )}
            </div>

            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {member.user.image ? (
                            <img src={member.user.image} alt="" className="h-10 w-10 rounded-full" />
                          ) : (
                            <Users className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{member.user.name || member.user.email}</p>
                          <p className="text-sm text-gray-600">{member.user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Role</p>
                          <p className="font-medium capitalize">{member.role}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Joined</p>
                          <p className="font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="font-medium text-green-600">Active</p>
                        </div>
                      </div>

                      {/* Permissions Preview */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-2">
                          {member.role === 'owner' && (
                            <>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Full Access</span>
                            </>
                          )}
                          {member.role === 'admin' && (
                            <>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Manage Businesses</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">View Financials</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Manage Team</span>
                            </>
                          )}
                          {member.role === 'member' && (
                            <>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">View Businesses</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">View Reports</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {canEditTeam && member.userId !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="h-4 w-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <UserX className="h-4 w-4 mr-2" />
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        {canViewFinancials && (
          <TabsContent value="billing" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Billing & Revenue</h3>
              <p className="text-gray-600">Billing features coming soon...</p>
            </Card>
          </TabsContent>
        )}

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Agency Settings</h3>
            <div className="space-y-4">
              <Link href="/admin/settings/profile" 
                    className="block p-4 border rounded-lg hover:bg-gray-50">
                <h4 className="font-medium">Agency Profile</h4>
                <p className="text-sm text-gray-600 mt-1">Update your agency information</p>
              </Link>
              
              <Link href="/admin/settings/integrations" 
                    className="block p-4 border rounded-lg hover:bg-gray-50">
                <h4 className="font-medium">Integrations</h4>
                <p className="text-sm text-gray-600 mt-1">Manage API keys and third-party services</p>
              </Link>
              
              <Link href="/admin/settings/white-label" 
                    className="block p-4 border rounded-lg hover:bg-gray-50">
                <h4 className="font-medium">White Label</h4>
                <p className="text-sm text-gray-600 mt-1">Customize branding for your clients</p>
              </Link>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}