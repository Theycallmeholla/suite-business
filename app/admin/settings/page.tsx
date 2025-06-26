import { requireAgencyAccess } from '@/lib/auth-helpers';
import { getUserContext } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { rootDomain } from '@/lib/utils';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building, CreditCard, Key, Bell, Palette } from 'lucide-react';

export const metadata: Metadata = {
  title: `Settings | ${rootDomain}`,
  description: `Manage settings for ${rootDomain}`
};

export default async function SettingsPage() {
  // Require agency access
  const session = await requireAgencyAccess();
  const userContext = await getUserContext(session.user.id);

  // Get agency team for agency settings
  const agencyTeam = await prisma.team.findFirst({
    where: { type: 'agency' },
    include: {
      members: {
        where: { userId: session.user.id }
      }
    }
  });

  const isOwner = userContext.agencyRole === 'owner';

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
              <Link href="/admin/team" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Team
              </Link>
              <Link href="/admin/settings" className="text-sm font-medium text-blue-600">
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your agency and personal settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="agency" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Agency
            </TabsTrigger>
            {isOwner && (
              <>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Integrations
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={session.user.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      defaultValue={session.user.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agency">
            <Card>
              <CardHeader>
                <CardTitle>Agency Settings</CardTitle>
                <CardDescription>
                  Configure your agency information and branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agency Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue="SiteBango Agency"
                      disabled={!isOwner}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Support Email
                    </label>
                    <input 
                      type="email" 
                      placeholder="support@youragency.com"
                      disabled={!isOwner}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  {isOwner && <Button type="submit">Save Changes</Button>}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {isOwner && (
            <>
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing & Subscription</CardTitle>
                    <CardDescription>
                      Manage your subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Billing management coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>API & Integrations</CardTitle>
                    <CardDescription>
                      Manage API keys and third-party integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">GoHighLevel</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Connected to agency location
                        </p>
                        <Button variant="outline" size="sm">
                          Manage Connection
                        </Button>
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Google Business Profile</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          OAuth integration configured
                        </p>
                        <Button variant="outline" size="sm">
                          View Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Email notifications for new sites</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Email notifications for new team members</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Weekly summary reports</span>
                  </label>
                </div>
                <Button className="mt-4">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize your dashboard appearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Theme customization coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}