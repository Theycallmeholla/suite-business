'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface GHLSettingsProps {
  site: {
    id: string;
    ghlLocationId?: string | null;
    ghlEnabled: boolean;
  };
  onUpdate?: () => void;
}

export function GHLSettings({ site, onUpdate }: GHLSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ghlEnabled, setGhlEnabled] = useState(site.ghlEnabled);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sites/${site.id}/ghl-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update GHL status');
      }

      setGhlEnabled(checked);
      toast.success(checked ? 'GoHighLevel integration enabled' : 'GoHighLevel integration disabled');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to update GoHighLevel status');
      setGhlEnabled(!checked); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = !!site.ghlLocationId;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          GoHighLevel
          {isConnected ? (
            <Badge variant="default" className="ml-2">Connected</Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">Not Connected</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>GoHighLevel Integration</DialogTitle>
          <DialogDescription>
            Manage your GoHighLevel CRM integration for lead capture and automation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Connection Status</p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'Connected to GoHighLevel' : 'Not connected'}
              </p>
            </div>
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Enable/Disable Integration */}
          {isConnected && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lead Sync</p>
                <p className="text-sm text-muted-foreground">
                  Automatically sync form submissions to GoHighLevel
                </p>
              </div>
              <Switch
                checked={ghlEnabled}
                onCheckedChange={handleToggle}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Location ID */}
          {site.ghlLocationId && (
            <div>
              <p className="font-medium text-sm">Location ID</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                {site.ghlLocationId}
              </code>
            </div>
          )}

          {/* Features */}
          <div>
            <p className="font-medium mb-2">Features</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Lead capture forms sync automatically
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Industry-specific custom fields
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Automated follow-up workflows
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Real-time webhook updates
              </li>
            </ul>
          </div>

          {/* Help Link */}
          <div className="pt-4 border-t">
            <a
              href="https://help.gohighlevel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              GoHighLevel Documentation
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
