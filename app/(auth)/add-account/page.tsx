'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function AddAccountPage() {
  useEffect(() => {
    // Automatically redirect to Google sign in
    signIn('google', { callbackUrl: '/onboarding' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to Google sign in...</p>
      </div>
    </div>
  );
}