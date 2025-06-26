import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { syncGHLTeamMembers } from '@/lib/team-sync';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Only super admins can sync team
    await requireSuperAdmin();
    
    // Run the sync
    await syncGHLTeamMembers();
    
    return NextResponse.json({ 
      success: true,
      message: 'Team sync initiated' 
    });
  } catch (error) {
    logger.error('Failed to sync team', {}, error as Error);
    return NextResponse.json(
      { error: 'Failed to sync team members' },
      { status: 500 }
    );
  }
}