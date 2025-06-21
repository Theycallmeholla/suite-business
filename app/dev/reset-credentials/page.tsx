'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ResetCredentialsPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [resetDetails, setResetDetails] = useState<any>(null);
  const router = useRouter();

  const handleReset = async () => {
    if (!confirm('This will delete ALL stored Google credentials and sessions. Continue?')) {
      return;
    }

    setIsResetting(true);
    try {
      // First, sign out the current user
      await signOut({ redirect: false });

      // Then reset all credentials
      const response = await fetch('/api/auth/reset-all', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResetComplete(true);
        setResetDetails(data);
        
        // Clear any remaining client-side storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to reset credentials');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-6">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              Reset Google Credentials
            </h1>
            <p className="text-gray-600">
              Use this tool to completely reset all stored Google credentials and start fresh
            </p>
          </div>

          {!resetComplete ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This will:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-yellow-700">
                  <li>Delete all stored Google OAuth tokens</li>
                  <li>Clear all active sessions</li>
                  <li>Sign out all users</li>
                  <li>Clear browser cookies and cache</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="font-semibold">Before you continue:</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Make sure your new Google credentials are in <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
                  <li>Ensure the Google account has GBP API access approved</li>
                  <li>Be ready to restart your development server after reset</li>
                </ol>
              </div>

              <Button
                onClick={handleReset}
                disabled={isResetting}
                variant="destructive"
                className="w-full mt-6"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Resetting credentials...
                  </>
                ) : (
                  'Reset All Credentials'
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">Reset Complete!</p>
                    <p className="text-sm text-green-700 mt-1">
                      All credentials have been cleared successfully.
                    </p>
                  </div>
                </div>
              </div>

              {resetDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-2">Reset Summary:</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• {resetDetails.details.accountsDeleted} OAuth connections deleted</li>
                    <li>• {resetDetails.details.sessionsDeleted} sessions cleared</li>
                    <li>• {resetDetails.details.cookiesCleared} cookies removed</li>
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {resetDetails?.nextSteps?.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => {
                    // Force reload to clear any remaining client state
                    window.location.href = '/signin';
                  }}
                  className="w-full"
                >
                  Go to Sign In
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Remember to restart your dev server if you changed environment variables
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}