import { getAuthSession } from '@/lib/auth';
import { isAgencyTeamMember, getAgencyRole, getUserTeams } from '@/lib/teams';

export async function checkUserRole(userId?: string) {
  if (!userId) return null;
  
  const agencyRole = await getAgencyRole(userId);
  
  if (agencyRole === 'owner') return 'super_admin';
  if (agencyRole === 'admin') return 'agency_admin';
  if (agencyRole === 'member') return 'agency_member';
  
  return 'client';
}

export async function requireAgencyAccess() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  const isAgency = await isAgencyTeamMember(session.user.id);
  
  if (!isAgency) {
    throw new Error('Unauthorized: Agency access required');
  }
  
  return session;
}

export async function requireSuperAdmin() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  const role = await getAgencyRole(session.user.id);
  
  if (role !== 'owner') {
    throw new Error('Unauthorized: Super admin access required');
  }
  
  return session;
}

export async function getUserContext(userId: string) {
  const teams = await getUserTeams(userId);
  const agencyRole = await getAgencyRole(userId);
  
  return {
    userId,
    teams,
    isAgency: !!agencyRole,
    agencyRole,
    // Default to simple dashboard for non-technical users
    preferSimpleDashboard: !agencyRole, // Agency team sees advanced by default
  };
}