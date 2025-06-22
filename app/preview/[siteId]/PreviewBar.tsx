'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Eye, EyeOff, Palette, Edit, Check, X, 
  Monitor, Tablet, Smartphone, ExternalLink,
  Loader2, ImagePlus, Pencil 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import { useEditMode } from '@/contexts/EditModeContext';
import { useViewport } from '@/contexts/ViewportContext';
import { GHLSettings } from '@/components/GHLSettings';
import { LogoUpload } from '@/components/LogoUpload';

interface PreviewBarProps {
  site: {
    id: string;
    businessName: string;
    subdomain: string;
    published: boolean;
    primaryColor: string;
    logo?: string | null;
    gbpLocationId?: string | null;
    ghlLocationId?: string | null;
    ghlEnabled: boolean;
  };
}

export function PreviewBar({ site }: PreviewBarProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(site.primaryColor);
  const [isImportingPhotos, setIsImportingPhotos] = useState(false);
  const { isEditMode, setIsEditMode } = useEditMode();
  const { viewport, setViewport } = useViewport();

  const handlePublish = async () => {
    if (!confirm('Are you ready to publish your site? It will be live immediately.')) {
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/sites/${site.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to publish site');
      }

      toast.success('Site published successfully!', {
        description: `Your site is now live at ${site.subdomain}.localhost:3000`,
      });

      // Redirect to the live site
      window.open(`http://${site.subdomain}.localhost:3000`, '_blank');
      router.push(`/dashboard/sites/${site.id}`);
    } catch (error) {
      toast.error('Failed to publish site');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleColorChange = async () => {
    try {
      const response = await fetch(`/api/sites/${site.id}/update-color`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryColor: tempColor }),
      });

      if (!response.ok) {
        throw new Error('Failed to update color');
      }

      toast.success('Color updated!');
      setShowColorPicker(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update color');
    }
  };

  const handleImportPhotos = async () => {
    if (!site.gbpLocationId) {
      toast.error('No Google Business Profile linked to this site');
      return;
    }

    setIsImportingPhotos(true);
    try {
      const response = await fetch(`/api/sites/${site.id}/import-photos`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to import photos');
      }

      const result = await response.json();
      toast.success(`Imported ${result.imported} photos from Google Business Profile`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to import photos');
    } finally {
      setIsImportingPhotos(false);
    }
  };

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'max-w-3xl mx-auto',
    mobile: 'max-w-sm mx-auto',
  };

  return (
    <>
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 text-white border-b transition-all duration-300",
        isEditMode ? "bg-blue-900 border-blue-800" : "bg-gray-900 border-gray-800"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Site info */}
            <div className="flex items-center space-x-4">
              <h2 className="font-semibold">Preview Mode</h2>
              <span className="text-sm text-gray-400">
                {site.businessName}
              </span>
              {site.published ? (
                <span className="flex items-center text-xs bg-green-600 text-white px-2 py-1 rounded">
                  <Eye className="w-3 h-3 mr-1" />
                  Published
                </span>
              ) : (
                <span className="flex items-center text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Draft
                </span>
              )}
            </div>

            {/* Center - Viewport selector */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-2 rounded ${viewport === 'desktop' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                title="Desktop view"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-2 rounded ${viewport === 'tablet' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                title="Tablet view"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-2 rounded ${viewport === 'mobile' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                title="Mobile view"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {/* Logo upload */}
              <LogoUpload site={site} onUpdate={() => router.refresh()} />

              {/* Color picker */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-gray-300"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Color
                </Button>
                
                {showColorPicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg p-4 z-50">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={tempColor}
                          onChange={(e) => setTempColor(e.target.value)}
                          className="h-10 w-20"
                        />
                        <input
                          type="text"
                          value={tempColor}
                          onChange={(e) => setTempColor(e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-sm text-gray-900"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTempColor(site.primaryColor);
                            setShowColorPicker(false);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleColorChange}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {site.gbpLocationId && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-gray-300"
                  onClick={handleImportPhotos}
                  disabled={isImportingPhotos}
                >
                  {isImportingPhotos ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-4 h-4 mr-2" />
                      Import Photos
                    </>
                  )}
                </Button>
              )}

              <Button
                size="sm"
                variant={isEditMode ? "default" : "ghost"}
                className={isEditMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-white hover:text-gray-300"}
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                {isEditMode ? 'Exit Edit Mode' : 'Edit Content'}
              </Button>

              <GHLSettings 
                site={site} 
                onUpdate={() => router.refresh()} 
              />

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:text-gray-300"
                asChild
              >
                <a 
                  href={`http://${site.subdomain}.localhost:3000`} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live
                </a>
              </Button>

              {!site.published && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Publish Site
                    </>
                  )}
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:text-gray-300"
                asChild
              >
                <Link href={`/dashboard/sites/${site.id}`}>
                  <X className="w-4 h-4 mr-2" />
                  Exit Preview
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
