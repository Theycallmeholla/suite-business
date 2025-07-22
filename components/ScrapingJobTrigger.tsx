/**
 * Scraping Job Trigger Component
 * Allows users to initiate scraping jobs from the UI
 */

'use client';

import { useState } from 'react';
import React from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
type JobType = 'serp_scrape' | 'business_profile' | 'website_analysis' | 'full_intelligence';

interface ScrapingJobProps {
  businessName: string;
  location: string;
  website?: string;
  placeId?: string;
  siteId?: string;
  onComplete?: (jobId: string) => void;
}

export function ScrapingJobTrigger({
  businessName,
  location,
  website,
  placeId,
  siteId,
  onComplete
}: ScrapingJobProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [jobType, setJobType] = useState<JobType>('full_intelligence');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<unknown>(null);

  const jobTypeInfo = {
    serp_scrape: {
      icon: Search,
      title: 'SERP Analysis',
      description: 'Analyze search engine results and competition'
    },
    business_profile: {
      icon: Building,
      title: 'Business Profile',
      description: 'Gather comprehensive business information'
    },
    website_analysis: {
      icon: Globe,
      title: 'Website Analysis',
      description: 'Analyze website content and SEO'
    },
    full_intelligence: {
      icon: Brain,
      title: 'Full Intelligence',
      description: 'Complete business intelligence gathering'
    }
  };

  const startScraping = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/intelligence/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: jobType,
          businessName,
          location,
          website,
          placeId,
          siteId,
          priority: 8
        })
      });

      const data = await response.json() as unknown;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start scraping');
      }

      setJobId(data.jobId);
      toast.success('Scraping job started successfully');
      
      // Start polling for status
      pollJobStatus(data.jobId);
      
    } catch (error) {
      toast.error(error.message || 'Failed to start scraping');
    } finally {
      setIsLoading(false);
    }
  };

  const pollJobStatus = async (id: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/intelligence/scrape/${id}`);
        const data = await response.json() as unknown;
        
        setJobStatus(data);

        if (data.status === 'completed') {
          toast.success('Scraping completed successfully!');
          onComplete?.(id);
          return true; // Stop polling
        } else if (data.status === 'failed') {
          toast.error(`Scraping failed: ${data.error}`);
          return true; // Stop polling
        }
        
        return false; // Continue polling
      } catch (error) {
        logger.error('Failed to check job status:', error);
        return false;
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  };

  const Icon = jobTypeInfo[jobType].icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enhanced Data Collection</CardTitle>
        <CardDescription>
          Gather comprehensive business intelligence using advanced scraping
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Collection Type</Label>
          <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(jobTypeInfo).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <info.icon className="h-4 w-4" />
                    <span>{info.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {jobTypeInfo[jobType].description}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Target Business</Label>
          <div className="text-sm space-y-1">
            <p><strong>{businessName}</strong></p>
            <p className="text-muted-foreground">{location}</p>
            {website && (
              <p className="text-muted-foreground text-xs">{website}</p>
            )}
          </div>
        </div>

        <Button 
          onClick={startScraping} 
          disabled={isLoading || !!jobId}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting scraping job...
            </>
          ) : (
            <>
              <Icon className="mr-2 h-4 w-4" />
              Start {jobTypeInfo[jobType].title}
            </>
          )}
        </Button>

        {jobStatus && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Status:</span>
              <span className={`font-medium ${
                jobStatus.status === 'completed' ? 'text-green-600' :
                jobStatus.status === 'failed' ? 'text-red-600' :
                jobStatus.status === 'running' ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                {jobStatus.status.toUpperCase()}
              </span>
            </div>
            
            {jobStatus.progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${jobStatus.progress}%` }}
                />
              </div>
            )}

            {jobStatus.responseTime && (
              <div className="flex items-center justify-between text-sm">
                <span>Response Time:</span>
                <span>{jobStatus.responseTime}ms</span>
              </div>
            )}

            {jobStatus.captchaEncountered && (
              <p className="text-sm text-yellow-600">
                ⚠️ CAPTCHA was encountered during scraping
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
