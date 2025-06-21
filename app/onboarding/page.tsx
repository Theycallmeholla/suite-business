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

type Step = 'gbp-check' | 'gbp-select' | 'gbp-search' | 'business-info';

interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  verified?: boolean;
  website?: string | null;
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
  const [searchResults, setSearchResults] = useState<BusinessLocation[]>([]);
  const [isCached, setIsCached] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [googleAccountEmail, setGoogleAccountEmail] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);
  
  // Check if we're coming back from adding a new account
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromAddAccount = urlParams.get('fromAddAccount');
    
    if (fromAddAccount === 'true' && step === 'gbp-select') {
      // Force refresh to get the new account's businesses
      console.log('Refreshing businesses after adding new account...');
      fetchUserBusinesses();
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [step]);

  // Fetch user's Google Business Profile locations
  const fetchUserBusinesses = async (accountId?: string) => {
    setIsLoading(true);
    setLoadingMessage('Checking your Google Business Profile accounts...');
    
    try {
      // Use provided accountId or the selected one
      const accountToUse = accountId || selectedAccountId;
      const url = accountToUse 
        ? `/api/gbp/my-locations?accountId=${accountToUse}`
        : '/api/gbp/my-locations';
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setBusinesses(data.locations || []);
        setIsCached(data.cached || false);
        setCacheAge(data.cacheAge || null);
        setGoogleAccountEmail(data.googleAccountEmail || null);
        
        // Log useful information
        if (data.cached) {
          console.log(`Using cached data (${data.cacheAge} minutes old)`);
        }
        if (data.accountsChecked > 0) {
          console.log(`Checked ${data.accountsChecked} business account(s), found ${data.totalLocations || 0} location(s)`);
        }
        if (data.apiCallsUsed) {
          console.log(`API calls used: ${data.apiCallsUsed}`);
        }
      } else {
        console.error('GBP API Error:', data);
        
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
      console.error('Error fetching businesses:', error);
      alert('Network error. Please check your connection and try again.');
      setBusinesses([]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
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
      await fetchUserBusinesses();
      setStep('gbp-select');
    } else if (value === 'no' || value === 'not-sure') {
      setStep('gbp-search');
    }
  };

  // Search for existing business listings
  const searchBusinessListings = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gbp/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    router.push('/auth/add-google-account');
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
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step === 'gbp-check' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'gbp-check' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Business Profile</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${
              step !== 'gbp-check' ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            <div className={`flex items-center ${
              step === 'business-info' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'business-info' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Business Details</span>
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
                        // Just refresh the account selector to show the new account
                        window.location.reload();
                      }}
                    >
                      Refresh accounts
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
                  We'll search to see if your business already exists on Google
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <input
                    id="business-name"
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <input
                    id="city"
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter your city"
                  />
                </div>

                <Button
                  onClick={() => {
                    const name = (document.getElementById('business-name') as HTMLInputElement)?.value;
                    const city = (document.getElementById('city') as HTMLInputElement)?.value;
                    if (name && city) {
                      searchBusinessListings(`${name} ${city}`);
                    }
                  }}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search for my business
                </Button>

                {searchResults.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="font-medium">Found these businesses:</p>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedBusiness(result.id);
                          setStep('business-info');
                        }}
                      >
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-gray-600">{result.address}</p>
                        {result.verified && (
                          <p className="text-sm text-green-600 mt-1">
                            ✓ Verified listing
                          </p>
                        )}
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => setStep('business-info')}
                      className="w-full mt-4"
                    >
                      None of these are my business
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Business info (placeholder for now) */}
          {step === 'business-info' && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Great! Let's gather your business details
              </h2>
              <p className="text-gray-600">
                Next, we'll collect information about your business...
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
