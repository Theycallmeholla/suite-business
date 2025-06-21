'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function ClearAuthPage() {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearTokens = async () => {
    if (!confirm('This will clear all Google authentication tokens and sign you out. Continue?')) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch('/api/auth/clear-tokens', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Tokens cleared successfully. ${data.deleted} account(s) removed.`);
        // Sign out using NextAuth
        const { signOut } = await import('next-auth/react');
        await signOut({ callbackUrl: '/signin' });
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to clear tokens');
    } finally {
      setIsClearing(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>This page is only available in development mode.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-yellow-600 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Clear Authentication Tokens</h1>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            This will remove all stored Google OAuth tokens and force you to sign in again. 
            Use this when switching between Google Cloud projects or OAuth clients.
          </p>

          <Button
            onClick={handleClearTokens}
            disabled={isClearing}
            variant="destructive"
            className="w-full"
          >
            {isClearing ? 'Clearing...' : 'Clear Tokens and Sign Out'}
          </Button>

          <div className="mt-4 text-xs text-gray-500">
            <p>This action will:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Delete all Google account connections</li>
              <li>Clear your current session</li>
              <li>Redirect you to sign in</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}