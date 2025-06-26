import { redirect } from 'next/navigation';
import { requireAgencyAccess } from '@/lib/auth-helpers';
import { getUserContext } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { rootDomain } from '@/lib/utils';
import { AgencyDashboard } from '@/components/admin/AgencyDashboard';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';

export const metadata: Metadata = {
  title: `Agency Dashboard | ${rootDomain}`,
  description: `Manage all sites for ${rootDomain}`
};

export default async function AdminPage() {
  // Require agency access
  const session = await requireAgencyAccess();
  const userContext = await getUserContext(session.user.id);

  // Get all sites across all users
  const sites = await prisma.site.findMany({
    include: {
      user: true,
      forms: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get team members
  const agencyTeam = await prisma.team.findFirst({
    where: { type: 'agency' },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });

  // Get system stats
  const totalUsers = await prisma.user.count();
  const publishedSites = sites.filter(site => site.published).length;
  const totalForms = await prisma.form.count();
  
  // Calculate revenue (placeholder - integrate with Stripe)
  const monthlyRevenue = sites.length * 297; // Assuming $297/month per site
  const totalLeads = totalForms * 12; // Placeholder calculation

  const stats = {
    totalSites: sites.length,
    totalUsers,
    publishedSites,
    monthlyRevenue,
    totalLeads
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="font-bold text-lg">SiteBango Agency</h2>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-sm font-medium text-blue-600">
                Dashboard
              </Link>
              <Link href="/admin/accounts" className="text-sm font-medium text-gray-600 hover:text-gray-900">
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
        <AgencyDashboard 
          stats={stats}
          sites={sites}
          teamMembers={agencyTeam?.members || []}
          userRole={userContext.agencyRole || 'member'}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
