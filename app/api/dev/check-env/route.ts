import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  // Check which Google credentials are loaded
  const envCheck = {
    googleClientId: {
      exists: !!process.env.GOOGLE_CLIENT_ID,
      prefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
      projectNumber: process.env.GOOGLE_CLIENT_ID?.split('-')[0],
    },
    googleClientSecret: {
      exists: !!process.env.GOOGLE_CLIENT_SECRET,
      prefix: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) + '...',
    },
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    instructions: [
      'If you see old credentials here after updating .env.local:',
      '1. Stop the development server (Ctrl+C)',
      '2. Start it again with: npm run dev',
      '3. Environment variables are only loaded on server start',
    ]
  };

  return NextResponse.json(envCheck);
}