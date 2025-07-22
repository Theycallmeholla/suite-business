'use client';

import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserPlus, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/toast';
import { AddGoogleAccountDialog } from '@/components/AddGoogleAccountDialog';

interface GoogleAccount {
  id: string;
  googleAccountId: string;
  email: string;
  isPrimary: boolean;
  isActive: boolean;
  hasGBPAccess: boolean;
}

interface GoogleAccountSelectorProps {
  onAccountSelect: (accountId: string) => void;
  currentAccountId?: string;
}

export function GoogleAccountSelector({ onAccountSelect, currentAccountId }: GoogleAccountSelectorProps) {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>(currentAccountId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gbp/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        
        // Select the first account if none selected
        if (!selectedAccount && data.accounts.length > 0) {
          const accountToSelect = currentAccountId || data.accounts[0].googleAccountId;
          setSelectedAccount(accountToSelect);
          onAccountSelect(accountToSelect);
        }
        
        return data.accounts;
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
    return [];
  }, [currentAccountId, selectedAccount, onAccountSelect]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Check for account addition completion
  useEffect(() => {
    const checkForNewAccount = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fromAddAccount = urlParams.get('fromAddAccount');
      
      if (fromAddAccount === 'true') {
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Close dialog if it was open
        setShowAddDialog(false);
        
        // Fetch accounts again
        const previousCount = accounts.length;
        const updatedAccounts = await fetchAccounts();
        
        // Select the newest account if one was added
        if (updatedAccounts.length > previousCount) {
          const newestAccount = updatedAccounts[updatedAccounts.length - 1];
          setSelectedAccount(newestAccount.googleAccountId);
          onAccountSelect(newestAccount.googleAccountId);
          toast.success(`Added ${newestAccount.email}`);
        }
      }
    };

    checkForNewAccount();
  }, [accounts.length, fetchAccounts, onAccountSelect]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    onAccountSelect(accountId);
  };

  const handleAddAccount = () => {
    setShowAddDialog(true);
  };

  const handleAccountAdded = async () => {
    // This is called after the dialog redirects
    // The actual refresh happens in the useEffect above
  };

  if (isLoading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded" />;
  }

  if (accounts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedAccount} onValueChange={handleAccountChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Google account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.googleAccountId}>
                <div className="flex items-center gap-2">
                  <span className={account.isActive ? '' : 'text-gray-500 line-through'}>
                    {account.email}
                  </span>
                  <div className="flex items-center gap-1">
                    {account.isPrimary && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Login Account
                      </span>
                    )}
                    {!account.isActive && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Suspended
                      </span>
                    )}
                    {account.isActive && !account.hasGBPAccess && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                        No GBP
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddAccount}
          title="Add another Google account"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      <AddGoogleAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAccountAdded={handleAccountAdded}
      />
    </>
  );
}
