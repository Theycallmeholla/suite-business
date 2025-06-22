'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Mail, 
  Phone,
  MapPin,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface BusinessClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  businessAddress: string;
  placeId: string;
  ownershipStatus: 'owned' | 'claimed_by_others' | 'unclaimed' | 'no_access';
  hasGbpAccess?: boolean;
  availableAccounts?: Array<{ id: string; email: string }>;
  onProceed: (action: 'import' | 'claim' | 'manual' | 'add_account') => void;
  onRecheck?: () => void;
}

export function BusinessClaimDialog({
  open,
  onOpenChange,
  businessName,
  businessAddress,
  placeId,
  ownershipStatus,
  hasGbpAccess,
  availableAccounts = [],
  onProceed,
  onRecheck,
}: BusinessClaimDialogProps) {
  const [verificationMethod, setVerificationMethod] = useState<string>('postcard');
  const [isLoading, setIsLoading] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  const handleAction = async (action: 'import' | 'claim' | 'manual' | 'add_account') => {
    setIsLoading(true);
    try {
      if (action === 'claim') {
        // Store verification preference
        localStorage.setItem('gbp_verification_method', verificationMethod);
      }
      onProceed(action);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Verification Status
          </DialogTitle>
          <DialogDescription>
            {businessName} - {businessAddress}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {ownershipStatus === 'owned' && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">You already manage this business</h3>
                  <p className="text-sm text-green-800 mt-1">
                    Great! We found this business in your Google Business Profile. 
                    We can import all its information to create your website.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-green-800">
                <p>✓ Business hours and contact info</p>
                <p>✓ Photos and descriptions</p>
                <p>✓ Services and categories</p>
              </div>
            </Card>
          )}

          {ownershipStatus === 'unclaimed' && (
            <div className="space-y-4">
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">This business can be claimed</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      This business exists on Google but hasn't been claimed yet. 
                      You can claim it to manage its information and connect it to your website.
                    </p>
                  </div>
                </div>
              </Card>

              <div>
                <Label className="text-base font-semibold mb-3 block">
                  How would you like to verify ownership?
                </Label>
                <RadioGroup value={verificationMethod} onValueChange={setVerificationMethod}>
                  <Card className="p-4 mb-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <RadioGroupItem value="postcard" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">Postcard (5-7 days)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Google will send a postcard with a verification code to your business address.
                        </p>
                      </div>
                    </label>
                  </Card>

                  <Card className="p-4 mb-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <RadioGroupItem value="phone" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">Phone call (instant)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Receive an automated call with a verification code at your business phone.
                        </p>
                      </div>
                    </label>
                  </Card>

                  <Card className="p-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <RadioGroupItem value="email" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">Email (instant)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Get a verification code sent to your business email address.
                        </p>
                      </div>
                    </label>
                  </Card>
                </RadioGroup>
              </div>
            </div>
          )}

          {ownershipStatus === 'claimed_by_others' && (
            <div className="space-y-4">
              <Card className="p-6 bg-amber-50 border-amber-200">
                <div className="flex items-start space-x-3">
                  <UserCheck className="h-6 w-6 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900">Already claimed by another user</h3>
                    <p className="text-sm text-amber-800 mt-1">
                      This business is currently managed by someone else on Google Business Profile.
                    </p>
                  </div>
                </div>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Your options:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Request access from the current owner</li>
                    <li>• Create a separate listing if you have legal rights</li>
                    <li>• Continue without Google Business Profile</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {ownershipStatus === 'no_access' && (
            <div className="space-y-4">
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900">Business found but no access</h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      This business exists on Google, but you don't have access to manage it with your current Google accounts.
                    </p>
                  </div>
                </div>
              </Card>

              {availableAccounts.length > 0 && (
                <Card className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-700">
                      <strong>Checked Google accounts:</strong>
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        setIsRechecking(true);
                        if (onRecheck) {
                          onRecheck();
                        } else {
                          // Fallback to inline check
                          try {
                            const response = await fetch('/api/gbp/check-ownership', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                placeId, 
                                businessName, 
                                address: businessAddress,
                                forceRefresh: true 
                              }),
                            });
                            
                            if (response.ok) {
                              const data = await response.json();
                              if (data.hasGbpAccess) {
                                toast.success('Access found! You can now import this business.');
                                window.location.reload(); // Reload to update the dialog
                              } else {
                                toast.error('Still no access found. Try adding the correct Google account.');
                              }
                            }
                          } catch (error) {
                            toast.error('Failed to re-check access');
                          } finally {
                            setIsRechecking(false);
                          }
                        }
                      }}
                      disabled={isRechecking}
                    >
                      {isRechecking ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        'Re-check all accounts'
                      )}
                    </Button>
                  </div>
                  <ul className="space-y-1">
                    {availableAccounts.map((account, index) => (
                      <li key={account.id || index} className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {account.email || `Account ${index + 1}`}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>To access this business profile:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Add the Google account that manages this business</li>
                    <li>• Request access if you're the rightful owner</li>
                    <li>• Continue with basic information only</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> If you manage this business with a different Google account, 
                  add that account to import all your business information including hours, photos, and services.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {ownershipStatus === 'owned' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleAction('manual')}
                disabled={isLoading}
              >
                Set up manually instead
              </Button>
              <Button
                onClick={() => handleAction('import')}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Import from Google
              </Button>
            </>
          )}

          {ownershipStatus === 'unclaimed' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleAction('manual')}
                disabled={isLoading}
              >
                Skip for now
              </Button>
              <Button
                onClick={() => handleAction('claim')}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Claim this business
              </Button>
            </>
          )}

          {ownershipStatus === 'claimed_by_others' && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  // Open Google's request access page
                  window.open('https://support.google.com/business/answer/4566671', '_blank');
                }}
                disabled={isLoading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Request access
              </Button>
              <Button
                onClick={() => handleAction('manual')}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Continue without GBP
              </Button>
            </>
          )}

          {ownershipStatus === 'no_access' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleAction('manual')}
                disabled={isLoading}
              >
                Use basic info only
              </Button>
              <Button
                onClick={() => handleAction('add_account')}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Google account
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}