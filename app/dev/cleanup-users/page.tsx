'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Users } from 'lucide-react';

export default function CleanupUsersPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dev/cleanup-users');
      const result = await response.json();
      setData(result);
    } catch (error) {
      alert('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const mergeDuplicates = async () => {
    if (!confirm('This will merge all duplicate user accounts. Continue?')) {
      return;
    }

    setIsMerging(true);
    try {
      const response = await fetch('/api/dev/cleanup-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'merge-duplicates' }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Success! Merged ${result.mergedEmails} duplicate emails and removed ${result.deletedUsers} users.`);
        fetchUserData(); // Refresh data
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to merge duplicates');
    } finally {
      setIsMerging(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-blue-600 mb-6">
            <Users className="h-5 w-5" />
            <h1 className="text-lg font-semibold">User Database Cleanup</h1>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{data.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{data.uniqueEmails}</div>
                  <div className="text-sm text-gray-600">Unique Emails</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {data.duplicates.length}
                  </div>
                  <div className="text-sm text-gray-600">Duplicate Emails</div>
                </div>
              </div>

              {data.duplicates.length > 0 && (
                <>
                  <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Duplicate Accounts</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {data.duplicates.map((dup: any) => (
                        <div key={dup.email} className="border p-4 rounded-lg">
                          <div className="font-medium">{dup.email}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {dup.count} accounts found
                          </div>
                          <div className="mt-2 space-y-1">
                            {dup.users.map((user: any, idx: number) => (
                              <div key={user.id} className="text-xs text-gray-500">
                                User {idx + 1}: Created {new Date(user.createdAt).toLocaleDateString()}
                                {user.hasAccounts && ' (has accounts)'}
                                {user.hasSessions && ' (has sessions)'}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-800">
                        Merging will keep the oldest user account and move all data to it.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={mergeDuplicates}
                    disabled={isMerging}
                    variant="destructive"
                    className="w-full"
                  >
                    {isMerging ? 'Merging...' : `Merge ${data.duplicates.length} Duplicate Email${data.duplicates.length > 1 ? 's' : ''}`}
                  </Button>
                </>
              )}

              {data.duplicates.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  <p>No duplicate users found. Database is clean!</p>
                </div>
              )}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}