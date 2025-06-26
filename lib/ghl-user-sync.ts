import { prisma } from '@/lib/prisma';
import { createGHLProClient } from '@/lib/ghl';
import { logger } from '@/lib/logger';

/**
 * Sync Strategy:
 * - App → GHL: Always sync (all app users must exist in GHL)
 * - GHL → App: Optional (not all GHL users need app access)
 */

/**
 * Ensure a user exists in GHL when they're added to the app
 * Called when:
 * 1. New user signs up
 * 2. User is added to agency team
 * 3. User creates a business (sub-account)
 */
export async function ensureUserInGHL(userId: string, locationId?: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamMembers: {
          include: {
            team: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const ghlClient = createGHLProClient();

    // Determine which location to add them to
    const targetLocationId = locationId || process.env.GHL_LOCATION_ID!;
    
    // Check if they're an agency team member
    const isAgencyMember = user.teamMembers.some(tm => tm.team.type === 'agency');

    // Determine their GHL role
    let ghlRole = 'user';
    if (isAgencyMember) {
      const agencyMembership = user.teamMembers.find(tm => tm.team.type === 'agency');
      if (agencyMembership?.role === 'owner' || agencyMembership?.role === 'admin') {
        ghlRole = 'admin';
      }
    }

    try {
      // Try to create user in GHL
      const ghlUser = await ghlClient.createLocationUser(targetLocationId, {
        email: user.email,
        firstName: user.name?.split(' ')[0] || user.email.split('@')[0],
        role: ghlRole
      });

      // Update user with GHL ID
      await prisma.user.update({
        where: { id: userId },
        data: { ghlUserId: ghlUser.id }
      });

      logger.info('Created user in GHL', { 
        email: user.email, 
        locationId: targetLocationId,
        role: ghlRole 
      });

      return ghlUser;
    } catch (error: any) {
      // User might already exist in GHL
      if (error.message?.includes('already exists')) {
        logger.info('User already exists in GHL', { email: user.email });
        
        try {
          // Try to find the existing user in GHL and update our record
          const ghlUsers = await ghlClient.users.list({
            locationId: targetLocationId,
            limit: 100,
          });
          
          const existingGhlUser = ghlUsers.users?.find(
            (ghlUser: any) => ghlUser.email === user.email
          );
          
          if (existingGhlUser) {
            await prisma.user.update({
              where: { id: userId },
              data: { ghlUserId: existingGhlUser.id }
            });
            
            logger.info('Found and linked existing GHL user', {
              email: user.email,
              ghlUserId: existingGhlUser.id,
            });
            
            return existingGhlUser;
          }
        } catch (lookupError) {
          logger.warn('Failed to lookup existing GHL user', {
            email: user.email,
          }, lookupError as Error);
        }
        
        return null;
      }
      throw error;
    }
  } catch (error) {
    logger.error('Failed to ensure user in GHL', error);
    throw error;
  }
}

/**
 * When a business is created, ensure the owner exists in that GHL sub-account
 */
export async function addUserToGHLSubAccount(userId: string, siteId: string) {
  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        user: true
      }
    });

    if (!site || !site.ghlLocationId) {
      throw new Error('Site or GHL location not found');
    }

    // Add user to the sub-account
    await ensureUserInGHL(userId, site.ghlLocationId);

    logger.info('Added user to GHL sub-account', {
      userId,
      businessName: site.businessName,
      locationId: site.ghlLocationId
    });
  } catch (error) {
    logger.error('Failed to add user to GHL sub-account', error);
    throw error;
  }
}

/**
 * Optional: Import GHL agency team members into the app
 * This is a one-way sync from GHL to App for initial setup
 */
export async function importGHLAgencyTeam() {
  try {
    logger.info('Starting GHL agency team import...');
    
    // Note: GHL doesn't have a direct API for this
    // You might need to manually provide a list or use a different endpoint
    
    // Example approach:
    // 1. Get list of users from GHL (manual or via API)
    // 2. Create them in the app if they don't exist
    // 3. Add them to agency team
    
    logger.warn('GHL agency team import not implemented - requires manual setup');
    
    // Return instructions for manual setup
    return {
      instructions: [
        '1. Get list of agency team members from GHL',
        '2. Have them sign in to the app with Google',
        '3. Add them to agency team via the Team tab',
        '4. Their GHL access will be maintained'
      ]
    };
  } catch (error) {
    logger.error('Failed to import GHL agency team', error);
    throw error;
  }
}

/**
 * When removing someone from the app, optionally remove from GHL
 */
export async function removeUserFromGHL(userId: string, locationId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.ghlUserId) {
      logger.warn('User or GHL ID not found, skipping GHL removal');
      return;
    }

    // Note: GHL might not support removing users via API
    // This is a placeholder for when/if they add this functionality
    
    logger.warn('GHL user removal not implemented by API');
    
    // For now, just log the action
    logger.info('Would remove user from GHL', {
      email: user.email,
      ghlUserId: user.ghlUserId,
      locationId
    });
  } catch (error) {
    logger.error('Failed to remove user from GHL', error);
    // Don't throw - removal from app should still proceed
  }
}

/**
 * Sync all app users to GHL (maintenance task)
 * Ensures everyone in the app exists in GHL
 */
export async function syncAllUsersToGHL() {
  try {
    logger.info('Starting sync of all users to GHL...');
    
    // Get all users who don't have a GHL ID
    const usersWithoutGHL = await prisma.user.findMany({
      where: {
        ghlUserId: null
      },
      include: {
        teamMembers: {
          include: {
            team: true
          }
        },
        sites: true
      }
    });

    logger.info(`Found ${usersWithoutGHL.length} users without GHL IDs`);

    for (const user of usersWithoutGHL) {
      try {
        // Determine which location(s) they need access to
        const locations = new Set<string>();
        
        // If agency member, add to agency location
        if (user.teamMembers.some(tm => tm.team.type === 'agency')) {
          locations.add(process.env.GHL_LOCATION_ID!);
        }
        
        // Add to each sub-account they own
        for (const site of user.sites) {
          if (site.ghlLocationId) {
            locations.add(site.ghlLocationId);
          }
        }

        // Create user in each location
        for (const locationId of locations) {
          await ensureUserInGHL(user.id, locationId);
        }
      } catch (error) {
        logger.error(`Failed to sync user ${user.email} to GHL`, error);
        // Continue with other users
      }
    }

    logger.info('Completed sync of users to GHL');
  } catch (error) {
    logger.error('Failed to sync users to GHL', error);
    throw error;
  }
}