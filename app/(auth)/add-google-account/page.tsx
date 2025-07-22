'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AddGoogleAccountPage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Immediately trigger Google OAuth with account selection
    const returnTo = searchParams.get('returnTo') || '/onboarding';
    const callbackUrl = `${returnTo}${returnTo.includes('?') ? '&' : '?'}fromAddAccount=true`;
    
    // Sign in with Google, forcing account selection
    signIn('google', {
      callbackUrl,
      redirect: true,
      // Force account selection
      prompt: 'select_account'
    });
  }, [searchParams]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">
          Redirecting to Google...
        </h2>
        <p className="text-gray-600 mt-2">
          Please select the Google account with your business profile
        </p>
      </div>
    </div>
  );
}
