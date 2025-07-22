'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, AlertCircle, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface AddGoogleAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountAdded?: () => void;
}

export function AddGoogleAccountDialog({ 
  open, 
  onOpenChange,
  onAccountAdded 
}: AddGoogleAccountDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAccount = () => {
    setIsLoading(true);
    
    // Store state for recovery
    localStorage.setItem('gbp_add_account_dialog', 'true');
    
    // Navigate to the OAuth flow
    const returnUrl = window.location.pathname + window.location.search;
    window.location.href = `/add-google-account?returnTo=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <DialogTitle>Add Google Account</DialogTitle>
          </div>
          <DialogDescription>
            Connect another Google account to access its Business Profiles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-800">Why add another account?</p>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Your business might be under a different Google account</li>
                  <li>• You may manage multiple businesses</li>
                  <li>• The account needs Google Business Profile access</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800">Security Note</p>
                <p className="text-yellow-700 mt-1">
                  This account will <strong>only</strong> access business data. 
                  Your login remains {session?.user?.email || 'your primary email'}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleAddAccount}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Redirecting to Google...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Google Account
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
