'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Search, AlertCircle, CheckCircle2, Loader2, Clock } from 'lucide-react';
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

type Step = 'gbp-check' | 'gbp-select' | 'gbp-search' | 'business-info' | 'industry-select' | 'manual-setup';

interface BusinessLocation {
  // Core identification
  id: string;
  name: string;
  languageCode?: string;
  storeCode?: string;
  
  // Contact information
  primaryPhone?: string | null;
  additionalPhones?: string[];
  website?: string | null;
  
  // Location details
  address: string;
  fullAddress?: any;
  coordinates?: any;
  serviceArea?: any;
  
  // Business categorization
  primaryCategory?: any;
  additionalCategories?: any[];
  
  // Operating information
  regularHours?: any;
  specialHours?: any;
  moreHours?: any[];
  openInfo?: any;
  
  // Services and features
  serviceItems?: any[];
  profile?: any;
  labels?: string[];
  
  // Metadata
  metadata?: any;
  relationshipData?: any;
  adWordsLocationExtensions?: any;
  
  // Legacy
  verified?: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up any saved state when leaving onboarding
      localStorage.removeItem('onboarding_step');
      localStorage.removeItem('onboarding_resume_data');
    };
  }, []);
  
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
      // Check if we have resume data
      const resumeDataStr = localStorage.getItem('onboarding_resume_data');
      if (resumeDataStr) {
        try {
          const resumeData = JSON.parse(resumeDataStr);
          localStorage.removeItem('onboarding_resume_data');
          
          // Restore the state based on where we were
          if (resumeData.step === 'gbp-select') {
            // We were on the "Select your business" page
            setStep('gbp-select');
            setHasGBP('yes');
            
            // Get the newly added account and select it
            fetchAccountsAndSelectNewest();
          } else if (resumeData.placeId) {
            // We were searching for a business
            setStep('gbp-search');
            // Trigger the ownership check again
            setTimeout(() => {
              handleBusinessAutocompleteSelect(
                resumeData.placeId,
                resumeData.businessName,
                resumeData.businessAddress
              );
            }, 100);
          }
        } catch (error) {
          logger.error('Error parsing resume data', {}, error as Error);
        }
      } else {
        // No resume data but coming from add account - restore to gbp-select
        // This handles the case where user was already on gbp-select
        const savedStep = localStorage.getItem('onboarding_step');
        if (savedStep === 'gbp-select') {
          setStep('gbp-select');
          setHasGBP('yes');
          fetchAccountsAndSelectNewest();
        }
      }
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

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
      await fetchUserBusinesses(undefined, false);
      setStep('gbp-select');
      // Save step to localStorage for recovery
      localStorage.setItem('onboarding_step', 'gbp-select');
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
      // Store the selected business and move to next step
      localStorage.setItem('selectedGBP', selectedBusiness);
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
          gbpLocationId: ownershipData.gbpLocationId, // Add this
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
      // Redirect to add Google account page
      // Store current state so we can resume after adding account
      localStorage.setItem('onboarding_resume_data', JSON.stringify({
        step: 'gbp-search',
        placeId: claimDialogData.placeId,
        businessName: claimDialogData.businessName,
        businessAddress: claimDialogData.businessAddress,
      }));
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
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
        </div>

        {/* Progress indicator */}
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
        </div>

        <Card className="p-8">
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

              <RadioGroup onValueChange={handleGBPCheck}>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="yes" />
                    <div className="flex-1">
                      <p className="font-medium">Yes, I have one</p>
                      <p className="text-sm text-gray-600">
                        I manage my business on Google
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="no" />
                    <div className="flex-1">
                      <p className="font-medium">No, I don't have one</p>
                      <p className="text-sm text-gray-600">
                        I need to create a new listing
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="not-sure" />
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
          )}

          {/* Step 2: Select from their businesses */}
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
                        // Save current state before adding account
                        localStorage.setItem('onboarding_resume_data', JSON.stringify({
                          step: 'gbp-select',
                          hasGBP: 'yes'
                        }));
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
          )}

          {/* Step 3: Search for business */}
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
          )}

          {/* Step 4: Business confirmation */}
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
              onSelect={async (industry) => {
                setSelectedIndustry(industry);
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
              } : undefined}
              onComplete={async (siteData) => {
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
