'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Search, Globe, Users, Image, MessageSquare, 
  CheckCircle, Loader2, AlertCircle 
} from 'lucide-react';

interface BusinessIntelligenceCollectorProps {
  businessName: string;
  placeId?: string;
  gbpData?: any;
  placesData?: any;
  onComplete: (intelligenceId: string, summary: any) => void;
  onSkip?: () => void;
}

export function BusinessIntelligenceCollector({
  businessName,
  placeId,
  gbpData,
  placesData,
  onComplete,
  onSkip,
}: BusinessIntelligenceCollectorProps) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  
  const collectIntelligence = async () => {
    setIsCollecting(true);
    setError(null);
    setProgress(0);
    
    try {
      // Step 1: Initialize
      setStatus('Initializing data collection...');
      setProgress(10);
      
      // Step 2: Call the API
      setStatus('Searching the web for business information...');
      setProgress(30);
      
      const response = await fetch('/api/business-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          placeId,
          gbpData,
          placesData,
        }),
      });
      
      setProgress(70);
      
      if (!response.ok) {
        throw new Error('Failed to collect business intelligence');
      }
      
      const data = await response.json();
      
      setProgress(90);
      setStatus('Processing collected data...');
      
      // Store summary
      setSummary(data.summary);
      
      setProgress(100);
      setStatus('Collection complete!');
      
      // Wait a moment to show completion
      setTimeout(() => {
        onComplete(data.intelligenceId, data.summary);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsCollecting(false);
    }
  };
  
  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (progress === 100) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <Loader2 className="h-5 w-5 animate-spin" />;
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Gather Business Intelligence
        </h2>
        <p className="text-gray-600">
          We'll search the web to find information about your business
        </p>
      </div>
      
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg mb-2">What we'll look for:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Search className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Web Mentions</p>
                <p className="text-sm text-gray-600">
                  Directory listings, citations, and references
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Social Media</p>
                <p className="text-sm text-gray-600">
                  Facebook, Instagram, LinkedIn profiles
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Image className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Photos & Logo</p>
                <p className="text-sm text-gray-600">
                  Business images from Google and other sources
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Reviews & Feedback</p>
                <p className="text-sm text-gray-600">
                  Customer reviews and testimonials
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {isCollecting && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{status}</span>
              {getStatusIcon()}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>
      )}
      
      {summary && !error && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="font-semibold mb-2">Collection Complete!</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>✓ {summary.dataCollected.searchResultsCount} search results</div>
              <div>✓ {summary.dataCollected.mentionsCount} business mentions</div>
              <div>✓ {summary.dataCollected.socialMediaFound} social profiles</div>
              <div>✓ {summary.dataCollected.photosCount} photos found</div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between">
        {onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isCollecting}
          >
            Skip This Step
          </Button>
        )}
        
        <Button
          onClick={collectIntelligence}
          disabled={isCollecting || progress === 100}
          className={onSkip ? '' : 'w-full'}
        >
          {isCollecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Collecting Data...
            </>
          ) : progress === 100 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Collection Complete
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Start Collection
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
