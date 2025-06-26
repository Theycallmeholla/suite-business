import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { addAgencyTeamMember, removeAgencyTeamMember, updateTeamMemberRole } from '@/lib/team-sync';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Only super admins can manage team
    await requireSuperAdmin();
    
    const data = await request.json();
    const { email, name, role } = data;
    
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, name, and role are required' },
        { status: 400 }
      );
    }
    
    if (role !== 'admin' && role !== 'member') {
      return NextResponse.json(
        { error: 'Role must be admin or member' },
        { status: 400 }
      );
    }
    
    const teamMember = await addAgencyTeamMember(email, name, role, true);
    
    return NextResponse.json({ 
      success: true, 
      teamMember 
    });
  } catch (error) {
    logger.error('Failed to add team member', {}, error as Error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add team member' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireSuperAdmin();
    
    const data = await request.json();
    const { userId, role, permissions } = data;
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }
    
    const updated = await updateTeamMemberRole(userId, role, permissions);
    
    return NextResponse.json({ 
      success: true, 
      teamMember: updated 
    });
  } catch (error) {
    logger.error('Failed to update team member', {}, error as Error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update team member' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireSuperAdmin();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await removeAgencyTeamMember(userId, false);
    
    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    logger.error('Failed to remove team member', {}, error as Error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove team member' },
      { status: 500 }
    );
  }
}