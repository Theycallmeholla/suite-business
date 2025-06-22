'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Trash2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface AdvancedSettingsProps {
  site: {
    id: string;
    published: boolean;
    subdomain: string;
    ghlLocationId?: string | null;
  };
  siteUrl: string;
  togglePublishAction: (siteId: string, published: boolean) => Promise<void>;
  deleteSiteAction: (siteId: string, deleteGHL: boolean) => Promise<void>;
}

export function AdvancedSettings({ 
  site, 
  siteUrl, 
  togglePublishAction, 
  deleteSiteAction 
}: AdvancedSettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteGHL, setDeleteGHL] = useState(false);

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const confirmMessage = deleteGHL && site.ghlLocationId
      ? 'Are you sure you want to delete this site AND its GoHighLevel sub-account? This action cannot be undone.'
      : 'Are you sure you want to delete this site? This action cannot be undone.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSiteAction(site.id, deleteGHL);
    } catch (error) {
      setIsDeleting(false);
      alert('Failed to delete site. Please try again.');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>
            Control when your site is visible to the public
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Site Status</p>
              <p className="text-sm text-gray-500">
                {site.published 
                  ? 'Your site is live and accessible to visitors' 
                  : 'Your site is in draft mode and only visible to you'}
              </p>
            </div>
            <form action={togglePublishAction.bind(null, site.id, !site.published)}>
              <Button 
                type="submit"
                variant={site.published ? "outline" : "default"}
              >
                {site.published ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </form>
          </div>

          {site.published && (
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Your site is live!
                  </p>
                  <a 
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-700 hover:text-green-800 underline flex items-center gap-1 mt-1"
                  >
                    {siteUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Delete this site</strong>
                <br />
                Once deleted, your site and all its content cannot be recovered.
                <br />
                <span className="text-xs mt-2 block">
                  Note: This will NOT delete your Google Business Profile. Your GBP will remain active on Google.
                </span>
              </AlertDescription>
            </Alert>

            {site.ghlLocationId && (
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Checkbox
                  id="deleteGHL"
                  checked={deleteGHL}
                  onCheckedChange={(checked) => setDeleteGHL(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="deleteGHL"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Also delete GoHighLevel sub-account
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    This will permanently delete the associated GoHighLevel sub-account and all its data including contacts, pipelines, and automations.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleDelete}>
              <Button 
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Site Permanently'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}