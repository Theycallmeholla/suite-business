'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

export default function GBPSetupPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gbp/check-access');
      const data = await response.json();
      setDiagnostics(data);
    } catch (error) {
      alert('Failed to run diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-6">Google Business Profile API Setup Guide</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">Prerequisites</h2>
              <div className="space-y-2 text-gray-600">
                <p>To use the Google Business Profile API, you need to:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Have a Google Cloud Project</li>
                  <li>Enable the required APIs</li>
                  <li>Request access to the GBP API (most important!)</li>
                  <li>Have a verified Google Business Profile</li>
                </ol>
              </div>
            </section>

            <section className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Step 1: Enable APIs</h2>
              <p className="text-gray-600 mb-3">
                Enable these APIs in your Google Cloud Console:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Google My Business Account Management API</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com', '_blank')}
                  >
                    Enable <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Google My Business Business Information API</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com', '_blank')}
                  >
                    Enable <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Step 2: Request API Access</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-800">Important: This step is required!</p>
                    <p className="text-yellow-700 mt-1">
                      Even after enabling the APIs, you'll have a quota of 0 until Google approves your access request.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-600">
                  You must request access to use the Google Business Profile API:
                </p>
                <Button
                  onClick={() => window.open('https://developers.google.com/my-business/content/prereqs', '_blank')}
                  className="w-full"
                >
                  Request API Access <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-sm text-gray-500">
                  The approval process typically takes 1-3 business days. You'll receive an email when approved.
                </p>
              </div>
            </section>

            <section className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Step 3: Run Diagnostics</h2>
              <p className="text-gray-600 mb-4">
                Check if your API access is properly configured:
              </p>
              
              <Button
                onClick={runDiagnostics}
                disabled={isLoading}
                className="w-full mb-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Run API Diagnostics
              </Button>

              {diagnostics && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Test Results:</h3>
                    {diagnostics.tests?.map((test: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-2">
                        <span>{test.api}</span>
                        {test.status === 'success' ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span className="text-sm">Passed</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Failed</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {diagnostics.summary && (
                    <div className={`p-4 rounded-lg ${
                      diagnostics.summary.hasAccess 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-medium ${
                        diagnostics.summary.hasAccess ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {diagnostics.summary.recommendation}
                      </p>
                    </div>
                  )}

                  {diagnostics.tests?.some((t: any) => t.status === 'failed') && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-gray-600">
                        View error details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                        {JSON.stringify(diagnostics, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </section>

            <section className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Common Issues</h2>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-red-600 mb-1">Quota exceeded (429 error)</h3>
                  <p className="text-sm text-gray-600">
                    This usually means your project hasn't been granted API access yet. Complete Step 2 above.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-red-600 mb-1">Permission denied (403 error)</h3>
                  <p className="text-sm text-gray-600">
                    The authenticated user might not have access to any Google Business Profiles, or the OAuth scope is insufficient.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-red-600 mb-1">API not enabled</h3>
                  <p className="text-sm text-gray-600">
                    Complete Step 1 to enable both required APIs in your Google Cloud Console.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}