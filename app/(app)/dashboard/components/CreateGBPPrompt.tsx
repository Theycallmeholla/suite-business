'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight, X, Info } from 'lucide-react';
import { toast } from '@/lib/toast';
import Link from 'next/link';

interface CreateGBPPromptProps {
  siteId: string;
  businessName: string;
  onDismiss?: () => void;
}

export function CreateGBPPrompt({ siteId, businessName, onDismiss }: CreateGBPPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    
    // Save dismissal preference
    if (typeof window !== 'undefined') {
      const dismissedPrompts = JSON.parse(localStorage.getItem('dismissedGBPPrompts') || '{}');
      dismissedPrompts[siteId] = true;
      localStorage.setItem('dismissedGBPPrompts', JSON.stringify(dismissedPrompts));
    }
    
    onDismiss?.();
  };

  // Check if already dismissed
  if (typeof window !== 'undefined') {
    const dismissedPrompts = JSON.parse(localStorage.getItem('dismissedGBPPrompts') || '{}');
    if (dismissedPrompts[siteId]) {
      return null;
    }
  }

  if (isDismissed) return null;

  return (
    <Card className="relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Boost Your Online Presence with Google Business Profile
          </h3>
          
          <p className="text-gray-600 mb-4">
            {businessName} is ready to be listed on Google! Create a Google Business Profile to:
          </p>

          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Appear in Google Maps and local search results</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Get customer reviews and ratings</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Share photos, hours, and updates with customers</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Automatically sync information with your website</span>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <Link href={`/settings/gbp/create?siteId=${siteId}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Google Business Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            
            <Button variant="ghost" onClick={handleDismiss}>
              Maybe Later
            </Button>
          </div>

          <div className="flex items-start gap-2 mt-4 text-xs text-gray-500">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              Creating a Google Business Profile is free and takes about 10 minutes. 
              Verification may take 1-2 weeks.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}