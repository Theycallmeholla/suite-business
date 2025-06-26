import { prisma } from '@/lib/prisma';
import { createGHLProClient } from '@/lib/ghl';
import { logger } from '@/lib/logger';

interface GHLTeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
  permissions: any;
}

/**
 * Sync GHL agency team members with our database
 * This should be run periodically or triggered by webhook
 */
export async function syncGHLTeamMembers() {
  try {
    const ghlClient = createGHLProClient();
    
    // Get the agency team
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

    if (!agencyTeam) {
      logger.error('No agency team found');
      return;
    }

    // Get team members from GHL
    // Note: This is a placeholder - GHL doesn't have a direct team members endpoint
    // You would typically get this from the agency users endpoint
    const ghlMembers = await fetchGHLAgencyUsers();

    // Create a map of existing members by email
    const existingMembersByEmail = new Map(
      agencyTeam.members.map(m => [m.user.email, m])
    );

    // Sync each GHL member
    for (const ghlMember of ghlMembers) {
      const existingMember = existingMembersByEmail.get(ghlMember.email);

      if (existingMember) {
        // Update existing member
        if (existingMember.ghlUserId !== ghlMember.id) {
          await prisma.teamMember.update({
            where: { id: existingMember.id },
            data: { ghlUserId: ghlMember.id }
          });
        }
      } else {
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: ghlMember.email }
        });

        if (!user) {
          // Create user (they'll need to sign in to complete profile)
          user = await prisma.user.create({
            data: {
              email: ghlMember.email,
              name: `${ghlMember.firstName} ${ghlMember.lastName || ''}`.trim(),
              ghlUserId: ghlMember.id,
            }
          });
        }

        // Add to agency team
        await prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: agencyTeam.id,
            role: mapGHLRoleToOurRole(ghlMember.role),
            ghlUserId: ghlMember.id,
          }
        });

        logger.info('Added GHL team member to agency', { 
          email: ghlMember.email,
          role: ghlMember.role 
        });
      }
    }

    logger.info('GHL team sync completed');
  } catch (error) {
    logger.error('Failed to sync GHL team members', error);
    throw error;
  }
}

/**
 * Fetch agency users from GHL
 * Note: This is a placeholder - implement based on actual GHL API
 */
async function fetchGHLAgencyUsers(): Promise<GHLTeamMember[]> {
  // In reality, you would call the GHL API here
  // For now, return empty array
  return [];
  
  // Example implementation:
  // const ghlClient = createGHLProClient();
  // const response = await ghlClient.getAgencyUsers();
  // return response.users;
}

/**
 * Map GHL roles to our role system
 */
function mapGHLRoleToOurRole(ghlRole: string): 'owner' | 'admin' | 'member' {
  // Map GHL roles to our simpler system
  switch (ghlRole.toLowerCase()) {
    case 'agency_admin':
    case 'admin':
      return 'admin';
    case 'agency_owner':
    case 'owner':
      return 'owner';
    default:
      return 'member';
  }
}

/**
 * Add a team member (and optionally create in GHL)
 */
export async function addAgencyTeamMember(
  email: string,
  name: string,
  role: 'admin' | 'member',
  createInGHL: boolean = false
) {
  try {
    // Get agency team
    const agencyTeam = await prisma.team.findFirst({
      where: { type: 'agency' }
    });

    if (!agencyTeam) {
      throw new Error('Agency team not found');
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create placeholder user
      user = await prisma.user.create({
        data: {
          email,
          name,
        }
      });
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId: agencyTeam.id
        }
      }
    });

    if (existingMember) {
      throw new Error('User is already a team member');
    }

    // Create in GHL if requested
    let ghlUserId: string | undefined;
    if (createInGHL) {
      const ghlClient = createGHLProClient();
      try {
        const ghlUser = await ghlClient.createLocationUser(
          process.env.GHL_LOCATION_ID!,
          {
            email,
            firstName: name.split(' ')[0],
            role: role === 'admin' ? 'admin' : 'user',
          }
        );
        ghlUserId = ghlUser.id;
      } catch (error) {
        logger.error('Failed to create user in GHL', error);
        // Continue anyway - they can be synced later
      }
    }

    // Add to team
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: agencyTeam.id,
        role,
        ghlUserId,
      },
      include: {
        user: true
      }
    });

    logger.info('Added team member', { email, role });
    return teamMember;
  } catch (error) {
    logger.error('Failed to add team member', error);
    throw error;
  }
}

/**
 * Remove a team member (optionally from GHL too)
 */
export async function removeAgencyTeamMember(
  userId: string,
  removeFromGHL: boolean = false
) {
  try {
    const agencyTeam = await prisma.team.findFirst({
      where: { type: 'agency' }
    });

    if (!agencyTeam) {
      throw new Error('Agency team not found');
    }

    const member = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: agencyTeam.id
        }
      }
    });

    if (!member) {
      throw new Error('Team member not found');
    }

    // Don't allow removing the owner
    if (member.role === 'owner') {
      throw new Error('Cannot remove team owner');
    }

    // Remove from GHL if requested
    if (removeFromGHL && member.ghlUserId) {
      // Note: GHL might not have a direct API to remove agency users
      logger.warn('GHL user removal not implemented');
    }

    // Remove from our database
    await prisma.teamMember.delete({
      where: { id: member.id }
    });

    logger.info('Removed team member', { userId });
  } catch (error) {
    logger.error('Failed to remove team member', error);
    throw error;
  }
}

/**
 * Update team member role/permissions
 */
export async function updateTeamMemberRole(
  userId: string,
  newRole: 'admin' | 'member',
  permissions?: any
) {
  try {
    const agencyTeam = await prisma.team.findFirst({
      where: { type: 'agency' }
    });

    if (!agencyTeam) {
      throw new Error('Agency team not found');
    }

    const member = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: agencyTeam.id
        }
      }
    });

    if (!member) {
      throw new Error('Team member not found');
    }

    // Don't allow changing owner role
    if (member.role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    // Update role
    const updated = await prisma.teamMember.update({
      where: { id: member.id },
      data: {
        role: newRole,
        permissions: permissions || member.permissions
      }
    });

    logger.info('Updated team member role', { userId, newRole });
    return updated;
  } catch (error) {
    logger.error('Failed to update team member role', error);
    throw error;
  }
}