import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

// Simple endpoint to get current user ID for linking accounts
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ userId: null });
    }

    return NextResponse.json({ 
      userId: session.user.id,
      email: session.user.email,
    });

  } catch (error) {
    return NextResponse.json({ userId: null });
  }
}