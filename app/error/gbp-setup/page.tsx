'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GBPSetupErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              Google Business Profile API Access Required
            </h1>
            <p className="text-gray-600">
              Your Google Cloud project needs API access approval before you can continue.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>Why is this happening?</strong> Google requires manual approval for access to the 
              Business Profile API. Even with the APIs enabled, your quota is 0 until approved.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold">To fix this issue:</h2>
            
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <strong>Request API Access</strong>
                <p className="text-sm text-gray-600 ml-6 mt-1">
                  Visit the Google Business Profile API prerequisites page and submit an access request.
                </p>
              </li>
              
              <li>
                <strong>Fill out the application</strong>
                <p className="text-sm text-gray-600 ml-6 mt-1">
                  Provide details about your use case and how you'll use the API.
                </p>
              </li>
              
              <li>
                <strong>Wait for approval</strong>
                <p className="text-sm text-gray-600 ml-6 mt-1">
                  Approval typically takes 1-3 business days. You'll receive an email confirmation.
                </p>
              </li>
              
              <li>
                <strong>Return here once approved</strong>
                <p className="text-sm text-gray-600 ml-6 mt-1">
                  After approval, your API quotas will be increased and you can continue setup.
                </p>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              onClick={() => window.open('https://developers.google.com/my-business/content/prereqs', '_blank')}
              className="flex-1"
            >
              Request API Access
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/dev/gbp-setup')}
              className="flex-1"
            >
              View Setup Guide
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Check out the{' '}
              <a 
                href="https://support.google.com/business/answer/7107242" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Business Profile Help Center
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}