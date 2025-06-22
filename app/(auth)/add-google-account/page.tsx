'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AddGoogleAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleAddAccount = async () => {
    setIsLoading(true);
    try {
      // Sign in with Google, forcing account selection
      await signIn('google', {
        callbackUrl: '/onboarding?fromAddAccount=true',
        redirect: true,
      });
    } catch (error) {
      console.error('Error adding account:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <div className="text-center mb-6">
            <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              Add Google Account
            </h1>
            <p className="text-gray-600">
              Sign in with a different Google account to access its Business Profiles
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-800">Why add another account?</p>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Your business might be under a different Google account</li>
                  <li>• You may manage multiple businesses with different accounts</li>
                  <li>• The account needs to have Google Business Profile access</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800">Important Security Note</p>
                <p className="text-yellow-700 mt-1">
                  This Google account will <strong>only</strong> be used to access Google Business Profile data. 
                  It <strong>cannot</strong> be used to sign in to your account. Only your primary 
                  email ({session?.user?.email || 'your login email'}) can sign in.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddAccount}
            disabled={isLoading}
            className="w-full mb-4"
            size="lg"
          >
            {isLoading ? 'Redirecting to Google...' : 'Add Google Account'}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500 text-center">
              Make sure the Google account you're adding has access to the Google Business Profiles you want to manage.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}