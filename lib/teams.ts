import { prisma } from '@/lib/prisma';
import { createGHLProClient } from '@/lib/ghl';
import { logger } from '@/lib/logger';

// Sync GHL agency team with our database
export async function syncAgencyTeam() {
  try {
    const ghlClient = createGHLProClient();
    
    // Get or create the agency team
    let agencyTeam = await prisma.team.findFirst({
      where: { type: 'agency' }
    });

    if (!agencyTeam) {
      agencyTeam = await prisma.team.create({
        data: {
          name: 'Agency Team',
          type: 'agency',
          ghlCompanyId: process.env.GHL_AGENCY_ID,
        }
      });
    }

    // In the future, we could sync team members from GHL API
    // For now, this sets up the structure
    
    logger.info('Agency team synced', { teamId: agencyTeam.id });
    return agencyTeam;
  } catch (error) {
    logger.error('Failed to sync agency team', error);
    throw error;
  }
}

// Check if a user is part of the agency team
export async function isAgencyTeamMember(userId: string): Promise<boolean> {
  const membership = await prisma.teamMember.findFirst({
    where: {
      userId,
      team: { type: 'agency' }
    }
  });
  
  return !!membership;
}

// Get user's role in the agency team
export async function getAgencyRole(userId: string): Promise<string | null> {
  const membership = await prisma.teamMember.findFirst({
    where: {
      userId,
      team: { type: 'agency' }
    }
  });
  
  return membership?.role || null;
}

// Add a user to the agency team
export async function addToAgencyTeam(
  userId: string, 
  role: 'owner' | 'admin' | 'member',
  ghlUserId?: string
) {
  const agencyTeam = await prisma.team.findFirst({
    where: { type: 'agency' }
  });

  if (!agencyTeam) {
    throw new Error('Agency team not found. Run syncAgencyTeam first.');
  }

  return prisma.teamMember.create({
    data: {
      userId,
      teamId: agencyTeam.id,
      role,
      ghlUserId,
    }
  });
}

// Create a client team when a new business is created
export async function createClientTeam(
  businessName: string,
  ownerId: string,
  ghlLocationId?: string
) {
  // Create the team
  const team = await prisma.team.create({
    data: {
      name: `${businessName} Team`,
      type: 'client',
      ghlCompanyId: ghlLocationId,
      members: {
        create: {
          userId: ownerId,
          role: 'owner'
        }
      }
    }
  });

  return team;
}

// Get all teams a user belongs to
export async function getUserTeams(userId: string) {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          sites: true,
          _count: {
            select: { members: true }
          }
        }
      }
    }
  });

  return memberships.map(m => ({
    ...m.team,
    role: m.role,
    joinedAt: m.createdAt
  }));
}

// Check if user can access a site
export async function canAccessSite(userId: string, siteId: string): Promise<boolean> {
  // Check direct ownership (legacy)
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId
    }
  });

  if (site) return true;

  // Check team access
  const teamSite = await prisma.site.findFirst({
    where: {
      id: siteId,
      team: {
        members: {
          some: { userId }
        }
      }
    }
  });

  if (teamSite) return true;

  // Check if agency team member (can access all sites)
  const isAgency = await isAgencyTeamMember(userId);
  return isAgency;
}

// Get sites accessible to a user
export async function getUserAccessibleSites(userId: string) {
  // Check if agency member first
  const isAgency = await isAgencyTeamMember(userId);
  
  if (isAgency) {
    // Agency members can see all sites
    return prisma.site.findMany({
      include: {
        user: true,
        team: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Otherwise, get sites from teams and direct ownership
  const sites = await prisma.site.findMany({
    where: {
      OR: [
        { userId }, // Direct ownership
        { // Team ownership
          team: {
            members: {
              some: { userId }
            }
          }
        }
      ]
    },
    include: {
      user: true,
      team: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return sites;
}