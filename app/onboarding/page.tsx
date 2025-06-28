'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Search, AlertCircle, CheckCircle2, Loader2, Clock, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GoogleAccountSelector } from '@/components/GoogleAccountSelector';
import { BusinessInfoForm } from './components/BusinessInfoForm';
import { BusinessConfirmation } from './components/BusinessConfirmation';
import { IndustrySelector } from './components/IndustrySelector';
import { ManualBusinessSetup } from './components/ManualBusinessSetup';
import { BusinessClaimDialog } from './components/BusinessClaimDialog';
import { toast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { BusinessAutocomplete } from '@/components/BusinessAutocomplete';
import { useOnboardingPersistence, type OnboardingState, type BusinessLocation } from '@/lib/onboarding-persistence';

type Step = 'gbp-check' | 'gbp-select' | 'gbp-search' | 'business-info' | 'industry-select' | 'manual-setup';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const persistence = useOnboardingPersistence();
  
  // State management with initial values from persistence
  const [isRestoringState, setIsRestoringState] = useState(true);
  const [step, setStep] = useState<Step>('gbp-check');
  const [hasGBP, setHasGBP] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [businesses, setBusinesses] = useState<BusinessLocation[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [isCached, setIsCached] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [googleAccountEmail, setGoogleAccountEmail] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [detectedIndustry, setDetectedIndustry] = useState<string>('');
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claimDialogData, setClaimDialogData] = useState<{
    businessName: string;
    businessAddress: string;
    placeId: string;
    ownershipStatus: 'owned' | 'claimed_by_others' | 'unclaimed' | 'no_access';
    hasGbpAccess?: boolean;
    availableAccounts?: Array<{ id: string; email: string }>;
    gbpLocationId?: string;
  } | null>(null);
  const [manualSetupData, setManualSetupData] = useState<any>(null);
  
  // Save state whenever it changes
  const saveState = useCallback(() => {
    const state: Partial<OnboardingState> = {
      step,
      hasGBP,
      selectedAccountId,
      googleAccountEmail,
      selectedBusiness,
      businesses,
      selectedIndustry,
      detectedIndustry,
      claimDialogData,
      manualSetupData,
      isCached,
      cacheAge,
    };
    persistence.save(state);
  }, [
    step, hasGBP, selectedAccountId, googleAccountEmail, selectedBusiness,
    businesses, selectedIndustry, detectedIndustry, claimDialogData,
    manualSetupData, isCached, cacheAge, persistence
  ]);

  // Persist state on every change
  useEffect(() => {
    if (!isRestoringState) {
      saveState();
    }
  }, [saveState, isRestoringState]);

  // Restore state on mount
  useEffect(() => {
    const savedState = persistence.load();
    if (savedState) {
      const stateAge = persistence.getStateAge();
      toast.info(`Resuming from where you left off ${stateAge ? `(${stateAge} minutes ago)` : ''}`);
      
      // Restore all state values
      if (savedState.step) setStep(savedState.step);
      if (savedState.hasGBP) setHasGBP(savedState.hasGBP);
      if (savedState.selectedAccountId) setSelectedAccountId(savedState.selectedAccountId);
      if (savedState.googleAccountEmail) setGoogleAccountEmail(savedState.googleAccountEmail);
      if (savedState.selectedBusiness) setSelectedBusiness(savedState.selectedBusiness);
      if (savedState.businesses) setBusinesses(savedState.businesses);
      if (savedState.selectedIndustry) setSelectedIndustry(savedState.selectedIndustry);
      if (savedState.detectedIndustry) setDetectedIndustry(savedState.detectedIndustry);
      if (savedState.claimDialogData) setClaimDialogData(savedState.claimDialogData);
      if (savedState.manualSetupData) setManualSetupData(savedState.manualSetupData);
      if (savedState.isCached !== undefined) setIsCached(savedState.isCached);
      if (savedState.cacheAge !== null) setCacheAge(savedState.cacheAge);
      
      // If we were in gbp-select, refetch businesses
      if (savedState.step === 'gbp-select' && savedState.selectedAccountId) {
        fetchUserBusinesses(savedState.selectedAccountId);
      }
    }
    setIsRestoringState(false);
  }, []);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);
  
  // Clean up on unmount (only when onboarding is completed)
  useEffect(() => {
    return () => {
      // Only clear if we're not just navigating away temporarily
      const isCompletingOnboarding = step === 'industry-select' && selectedIndustry;
      if (isCompletingOnboarding) {
        persistence.clear();
      }
    };
  }, [step, selectedIndustry, persistence]);
  
  // Check if we're coming back from adding a new account
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromAddAccount = urlParams.get('fromAddAccount');
    const error = urlParams.get('error');
    
    // Handle errors first
    if (error === 'AccountAlreadyLinked') {
      toast.error('This Google account is already linked to another user');
    } else if (error === 'oauth_error') {
      toast.error('Google authentication was cancelled or failed');
    } else if (error === 'invalid_state' || error === 'state_expired') {
      toast.error('Authentication session expired. Please try again');
    } else if (error === 'token_exchange_failed') {
      toast.error('Failed to complete Google authentication');
    }
    
    if (fromAddAccount === 'true') {
      // We're coming back from adding account - state should be restored automatically
      // Just fetch the newest account
      if (step === 'gbp-select') {
        fetchAccountsAndSelectNewest();
      }
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [step]);
  
  // Fetch user's Google Business Profile locations
  const fetchUserBusinesses = async (accountId?: string, forceRefresh?: boolean) => {
    setIsLoading(true);
    setLoadingMessage('Checking your Google Business Profile accounts...');
    
    try {
      // Use provided accountId or the selected one
      const accountToUse = accountId || selectedAccountId;
      let url = accountToUse 
        ? `/api/gbp/my-locations?accountId=${accountToUse}`
        : '/api/gbp/my-locations';
      
      if (forceRefresh) {
        url += (url.includes('?') ? '&' : '?') + 'refresh=true';
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setBusinesses(data.locations || []);
        setIsCached(data.cached || false);
        setCacheAge(data.cacheAge || null);
        setGoogleAccountEmail(data.googleAccountEmail || null);
        
        // Log useful information
        if (data.cached) {
          logger.info('Using cached GBP data', {
      metadata: { cacheAge: data.cacheAge }
    });
        }
        if (data.accountsChecked > 0) {
          logger.info('Fetched GBP data', {
      metadata: { 
            accountsChecked: data.accountsChecked, 
            totalLocations: data.totalLocations || 0 
          }
    });
        }
        if (data.apiCallsUsed) {
          logger.info('GBP API usage', {
      metadata: { apiCallsUsed: data.apiCallsUsed }
    });
        }
      } else {
        logger.error('GBP API Error', { metadata: data });        
        // Handle specific error cases
        if (response.status === 403) {
          if (data.action === 'request_access') {
            // Need to request API access - redirect to setup error page
            router.push('/error/gbp-setup');
            return;
          } else if (data.error === 'Google Business Profile API is not enabled') {
            // Show API enablement instructions
            alert(`Google Business Profile API needs to be enabled.\n\n${data.details}\n\nPlease enable the APIs and try again.`);
            if (data.enableUrl) {
              window.open(data.enableUrl, '_blank');
            }
          } else if (data.error === 'Insufficient permissions') {
            // Handle permission issues
            const reasons = data.possibleReasons?.join('\n• ') || '';
            alert(`Permission Error\n\n${data.details}\n\nPossible reasons:\n• ${reasons}`);
          }
        } else if (response.status === 429) {
          // Rate limit or quota exceeded
          if (data.retryAfter) {
            alert(`API rate limit exceeded. Please wait ${data.retryAfter} seconds and try again.`);
          } else {
            alert(`Google API quota exceeded. This usually resets within an hour.\n\n${data.details}`);
          }
        } else if (response.status === 401) {
          // Re-authenticate
          if (data.action === 'reauth') {
            alert(data.details);
            // Sign out first to clear old tokens
            import('next-auth/react').then(({ signOut }) => {
              signOut({ callbackUrl: '/signin?error=OAuthChanged' });
            });
          } else {
            router.push('/signin?error=SessionExpired');
          }
        } else {
          // Generic error
          alert(data.error || 'Failed to fetch business locations');
        }
        setBusinesses([]);
      }
    } catch (error) {
      logger.error('Error fetching businesses', {}, error as Error);
      alert('Network error. Please check your connection and try again.');
      setBusinesses([]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  // Fetch accounts and select the newest one
  const fetchAccountsAndSelectNewest = async () => {
    try {
      const response = await fetch('/api/gbp/accounts');
      if (response.ok) {
        const data = await response.json();
        const accounts = data.accounts || [];
        
        if (accounts.length > 0) {
          // Sort by creation date (newest first) or just take the last one
          const newestAccount = accounts[accounts.length - 1];
          setSelectedAccountId(newestAccount.googleAccountId);
          
          // Now fetch businesses for this account
          await fetchUserBusinesses(newestAccount.googleAccountId);
        }
      }
    } catch (error) {
      logger.error('Error fetching accounts', {}, error as Error);
    }
  };

  // Handle account selection
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    // Refetch businesses when account changes
    if (step === 'gbp-select' && accountId) {
      fetchUserBusinesses(accountId);
    }
  };

  // Handle GBP check answer
  const handleGBPCheck = async (value: string) => {
    setHasGBP(value);
    
    if (value === 'yes') {
      setIsLoading(true);
      setLoadingMessage('Loading your Google Business Profile...');
      await fetchUserBusinesses(undefined, false);
      setStep('gbp-select');
    } else if (value === 'no') {
      // Go directly to manual setup
      setStep('manual-setup');
    } else if (value === 'not-sure') {
      // Let them search for their business
      setStep('gbp-search');
    }
  };

  // Note: searchBusinessListings removed in favor of BusinessAutocomplete component
  
  const handleBusinessSelect = () => {
    if (selectedBusiness) {
      // Move to next step
      setStep('business-info');
    }
  };

  const handleNoBusinessFound = () => {
    // User needs to authenticate with a different Google account
    // or create a new listing
    router.push('/add-google-account');
  };

  // Helper function to proceed with getting business details
  const proceedWithBusinessDetails = async (placeId: string, businessName: string, address: string) => {
    setLoadingMessage('Getting your business details...');
    
    try {
      const response = await fetch('/api/gbp/place-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId }),
      });

      if (response.ok) {
        const data = await response.json();
        const details = data.details;
        
        // Convert place details to our business location format
        const businessLocation: BusinessLocation = {
          id: placeId,
          name: businessName,
          address: details.formatted_address || address,
          primaryPhone: details.formatted_phone_number || null,
          website: details.website || null,
          coordinates: details.location,
          regularHours: details.opening_hours,
        };
        
        setSelectedBusiness(placeId);
        setBusinesses([businessLocation]);
        setStep('business-info');
      } else {
        toast.error('Failed to get business details');
      }
    } catch (error) {
      logger.error('Error fetching place details', {}, error as Error);
      toast.error('Failed to get business details');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  // Handle business autocomplete selection
  const handleBusinessAutocompleteSelect = async (placeId: string, businessName: string, address: string) => {
    setIsLoading(true);
    setLoadingMessage('Checking business ownership...');
    
    try {
      // First, check ownership status
      const ownershipResponse = await fetch('/api/gbp/check-ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, businessName, address }),
      });

      if (ownershipResponse.ok) {
        const ownershipData = await ownershipResponse.json();
        
        // Show claim dialog
        setClaimDialogData({
          businessName,
          businessAddress: address,
          placeId,
          ownershipStatus: ownershipData.ownershipStatus,
          hasGbpAccess: ownershipData.hasGbpAccess,
          availableAccounts: ownershipData.availableAccounts,
          gbpLocationId: ownershipData.gbpLocationId,
        });
        setShowClaimDialog(true);
        setIsLoading(false);
        setLoadingMessage('');
        
        // If user has GBP access, use the GBP location ID instead of Place ID
        if (ownershipData.hasGbpAccess && ownershipData.gbpLocationId) {
          setSelectedBusiness(ownershipData.gbpLocationId);
          // Also fetch the full GBP location data
          const locations = await fetchUserBusinesses(ownershipData.accountId);
          // Find the specific location
          const gbpLocation = businesses.find(b => b.id === ownershipData.gbpLocationId);
          if (gbpLocation) {
            setBusinesses([gbpLocation]);
          }
        } else {
          // Store the place ID for manual/Places API flow
          setSelectedBusiness(placeId);
        }
      } else {
        // If ownership check fails, proceed without it
        await proceedWithBusinessDetails(placeId, businessName, address);
      }
    } catch (error) {
      logger.error('Error checking ownership', {}, error as Error);
      // Fallback to just getting details
      await proceedWithBusinessDetails(placeId, businessName, address);
    }
  };
  
  // Handle claim dialog actions
  const handleClaimAction = async (action: 'import' | 'claim' | 'manual' | 'add_account') => {
    if (!claimDialogData) return;

    if (action === 'manual') {
      // For manual setup, pre-fill with Places API data if available
      setSelectedBusiness(claimDialogData.placeId);
      setStep('manual-setup');
    } else if (action === 'add_account') {
      // State will be automatically restored when they come back
      router.push('/add-google-account?returnTo=/onboarding');
    } else if (action === 'import') {
      // User has GBP access - use GBP data
      if (claimDialogData.hasGbpAccess && claimDialogData.gbpLocationId) {
        // Set the GBP location ID as selected business
        setSelectedBusiness(claimDialogData.gbpLocationId);
        // Fetch the full business data from GBP
        setIsLoading(true);
        setLoadingMessage('Fetching your business details from Google...');
        
        try {
          // Fetch all locations for the account
          await fetchUserBusinesses();
          // The selected business is already set, so move to confirmation
          setStep('business-info');
        } catch (error) {
          logger.error('Error fetching GBP data', {}, error as Error);
          toast.error('Failed to fetch business details');
        } finally {
          setIsLoading(false);
          setLoadingMessage('');
        }
      } else {
        // No GBP access - use Places API data
        await proceedWithBusinessDetails(
          claimDialogData.placeId,
          claimDialogData.businessName,
          claimDialogData.businessAddress
        );
      }
    } else if (action === 'claim') {
      // Claiming - use Places API data for now
      await proceedWithBusinessDetails(
        claimDialogData.placeId,
        claimDialogData.businessName,
        claimDialogData.businessAddress
      );
    }
  };
  
  if (status === 'loading' || isRestoringState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          {isRestoringState && (
            <p className="text-sm text-gray-500">Restoring your progress...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Resume progress banner */}
        {persistence.hasValidState() && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-900">
                Your progress has been saved automatically
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to start over? This will clear your saved progress.')) {
                  persistence.clear();
                  window.location.reload();
                }
              }}
            >
              Start Over
            </Button>
          </div>
        )}        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Dashboard
          </Button>
        </div>        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step === 'gbp-check' || step === 'gbp-select' || step === 'gbp-search' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'gbp-check' || step === 'gbp-select' || step === 'gbp-search' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Business Profile</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${
              step === 'business-info' || step === 'industry-select' ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            <div className={`flex items-center ${
              step === 'business-info' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'business-info' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Confirm Details</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${
              step === 'industry-select' ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            <div className={`flex items-center ${
              step === 'industry-select' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'industry-select' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Select Industry</span>
            </div>
          </div>
        </div>        <Card className="p-8">
          {/* Step 1: Check if they have GBP */}
          {step === 'gbp-check' && (
            <div className="space-y-6">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Do you have a Google Business Profile?
                </h2>
                <p className="text-gray-600">
                  This helps customers find you on Google Maps and Search
                </p>
              </div>

              <RadioGroup value={hasGBP} onValueChange={handleGBPCheck} disabled={isLoading}>
                <div className="space-y-3">
                  <label className={`flex items-center space-x-3 p-4 border rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                    <RadioGroupItem value="yes" disabled={isLoading} />
                    <div className="flex-1">
                      <p className="font-medium">Yes, I have one</p>
                      <p className="text-sm text-gray-600">
                        I manage my business on Google
                      </p>
                    </div>
                    {isLoading && hasGBP === 'yes' && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </label>
                  
                  <label className={`flex items-center space-x-3 p-4 border rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                    <RadioGroupItem value="no" disabled={isLoading} />
                    <div className="flex-1">
                      <p className="font-medium">No, I don't have one</p>
                      <p className="text-sm text-gray-600">
                        I need to create a new listing
                      </p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center space-x-3 p-4 border rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                    <RadioGroupItem value="not-sure" disabled={isLoading} />
                    <div className="flex-1">
                      <p className="font-medium">I'm not sure</p>
                      <p className="text-sm text-gray-600">
                        Let's search for my business
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>
          )}          {/* Step 2: Select from their businesses */}
          {step === 'gbp-select' && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Select your business
                </h2>
                <p className="text-gray-600">
                  Choose the business you want to manage
                </p>
              </div>

              <div className="mb-4">
                <Label className="text-sm text-gray-600 mb-2 block">Google Account</Label>
                <GoogleAccountSelector
                  onAccountSelect={handleAccountSelect}
                  currentAccountId={selectedAccountId}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Additional Google accounts are only used to access business data. 
                  Only your primary account can sign in.
                </p>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  {loadingMessage && (
                    <p className="text-sm text-gray-600">{loadingMessage}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    This may take a few moments due to Google's API rate limits
                  </p>
                </div>
              ) : businesses.length > 0 ? (
                <div className="space-y-4">
                  {googleAccountEmail && (
                    <div className="text-center text-sm text-gray-600 mb-2">
                      Showing businesses for: <span className="font-medium">{googleAccountEmail}</span>
                    </div>
                  )}
                  
                  {isCached && cacheAge !== null && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>Using data from {cacheAge < 60 ? `${cacheAge} minutes` : `${Math.floor(cacheAge / 60)} hours`} ago</span>
                    </div>
                  )}
                  
                  <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          <div className="flex items-center space-x-2">
                            <span>{business.name}</span>
                            {business.verified && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {business.address}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleBusinessSelect}
                      disabled={!selectedBusiness}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        router.push('/add-google-account?returnTo=/onboarding');
                      }}
                    >
                      Add account
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    No businesses found in this account
                  </p>
                  {googleAccountEmail && (
                    <p className="text-sm text-gray-500 mb-4">
                      Currently using: {googleAccountEmail}
                    </p>
                  )}
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Force refresh with cache bypass
                        fetchUserBusinesses(selectedAccountId, true);
                      }}
                    >
                      Force Refresh
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.reload();
                      }}
                    >
                      Reload Page
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}          {/* Step 3: Search for business */}
          {step === 'gbp-search' && (
            <div className="space-y-6">
              <div className="text-center">
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Let's find your business
                </h2>
                <p className="text-gray-600">
                  Start typing your business name and we'll search Google for you
                </p>
              </div>

              <div className="space-y-4">
                <BusinessAutocomplete
                  onSelect={handleBusinessAutocompleteSelect}
                  placeholder="Start typing your business name..."
                  autoFocus
                />

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Can't find your business?
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setStep('manual-setup')}
                    className="w-full"
                  >
                    Enter Business Information Manually
                  </Button>
                </div>
              </div>
            </div>
          )}          {/* Step 4: Business confirmation */}
          {step === 'business-info' && (
            <BusinessConfirmation 
              business={businesses.find(b => b.id === selectedBusiness)}
              selectedAccountId={selectedAccountId}
              onConfirm={(detectedIndustry) => {
                setDetectedIndustry(detectedIndustry || 'general');
                setSelectedIndustry(detectedIndustry || 'general');
                setStep('industry-select');
              }}
              onEdit={() => {
                // For now, use the form as fallback
                // In future, create inline edit mode
                setStep('gbp-select');
              }}
            />
          )}

          {/* Step 5: Industry selection */}
          {step === 'industry-select' && (
            <IndustrySelector
              detectedIndustry={detectedIndustry}
              businessId={selectedBusiness.startsWith('locations/') ? selectedBusiness : undefined}
              placeId={selectedBusiness.startsWith('ChIJ') ? selectedBusiness : undefined}
              accountId={selectedAccountId}
              onSelect={async (industry) => {
                setSelectedIndustry(industry);
                // Clear persistence after successful completion
                persistence.clear();
                
                // Now create the site with the confirmed industry
                try {
                  // Determine if this is a GBP location or a Place ID
                  const isGBPLocation = selectedBusiness.startsWith('locations/');
                  const isPlaceId = selectedBusiness.startsWith('ChIJ');
                  
                  // Build the request body
                  const requestBody: any = {
                    locationId: selectedBusiness,
                    accountId: selectedAccountId,
                    industry: industry,
                  };
                  
                  // Only add place-specific data if it's actually a Place ID (not GBP)
                  if (isPlaceId) {
                    requestBody.isPlaceId = true;
                    if (claimDialogData) {
                      requestBody.placeData = {
                        name: claimDialogData.businessName,
                        address: claimDialogData.businessAddress,
                      };
                    }
                  }
                  
                  const response = await fetch('/api/sites/create-from-gbp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                  });

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create site');
                  }

                  const site = await response.json();
                  
                  // Redirect to preview so user can see their site before publishing
                  router.push(`/preview/${site.id}`);
                } catch (error: any) {
                  alert(`Error: ${error.message}`);
                }
              }}
              onBack={() => setStep('business-info')}
            />
          )}
          
          {/* Step: Manual Setup */}
          {step === 'manual-setup' && (
            <ManualBusinessSetup
              // Pre-fill with Places API data if we have it
              initialData={selectedBusiness && claimDialogData ? {
                businessName: claimDialogData.businessName,
                address: claimDialogData.businessAddress,
                placeId: selectedBusiness,
              } : manualSetupData}
              onComplete={async (siteData) => {
                // Clear persistence after successful completion
                persistence.clear();
                
                // Create site with manual data
                try {
                  const response = await fetch('/api/sites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...siteData,
                      manualSetup: true,
                      gbpPlaceId: selectedBusiness || undefined, // Include place ID if we have it
                    }),
                  });

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create site');
                  }

                  const site = await response.json();
                  
                  // Redirect to preview
                  router.push(`/preview/${site.id}`);
                } catch (error: any) {
                  alert(`Error: ${error.message}`);
                }
              }}
              onBack={() => setStep('gbp-check')}
              onUpdate={(data) => setManualSetupData(data)}
            />
          )}
        </Card>

        {/* Business Claim Dialog */}
        {claimDialogData && (
          <BusinessClaimDialog
            open={showClaimDialog}
            onOpenChange={setShowClaimDialog}
            businessName={claimDialogData.businessName}
            businessAddress={claimDialogData.businessAddress}
            placeId={claimDialogData.placeId}
            ownershipStatus={claimDialogData.ownershipStatus}
            hasGbpAccess={claimDialogData.hasGbpAccess}
            availableAccounts={claimDialogData.availableAccounts}
            onProceed={handleClaimAction}
            onRecheck={() => {
              // Re-run the ownership check with the same data
              setShowClaimDialog(false);
              handleBusinessAutocompleteSelect(
                claimDialogData.placeId,
                claimDialogData.businessName,
                claimDialogData.businessAddress
              );
            }}
          />
        )}
      </div>
    </div>
  );
}