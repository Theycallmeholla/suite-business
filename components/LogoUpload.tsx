'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Upload, X, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { logger } from '@/lib/logger';

interface LogoUploadProps {
  site: {
    id: string;
    businessName: string;
    logo?: string | null;
  };
  onUpdate: () => void;
}

export function LogoUpload({ site, onUpdate }: LogoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(site.logo || null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('siteId', site.id);

      const response = await fetch('/api/sites/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload logo');
      }

      const { logoUrl } = await response.json();
      
      // Update site logo
      const updateResponse = await fetch(`/api/sites/${site.id}/update-logo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: logoUrl }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update site logo');
      }

      toast.success('Logo uploaded successfully!');
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      logger.error('Logo upload error:', {}, error as Error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
      setPreviewUrl(site.logo || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove your logo?')) {
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch(`/api/sites/${site.id}/update-logo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: null }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove logo');
      }

      toast.success('Logo removed');
      setPreviewUrl(null);
      onUpdate();
    } catch (error) {
      logger.error('Logo removal error:', {}, error as Error);
      toast.error('Failed to remove logo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:text-gray-300"
        >
          <Image className="w-4 h-4 mr-2" />
          Logo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Logo</DialogTitle>
          <DialogDescription>
            Upload a logo for {site.businessName}. Recommended size: 200x50px or similar aspect ratio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="max-h-24 max-w-full mx-auto"
                  />
                  {!isUploading && (
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Drag a new image here or click to replace
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your logo here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, or SVG up to 5MB
                </p>
              </>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="logo-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="logo-upload"
              className={`inline-block mt-4 ${
                isUploading ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                asChild
              >
                <span>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Select File'
                  )}
                </span>
              </Button>
            </label>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p className="font-semibold mb-1">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use a transparent background (PNG) for flexibility</li>
              <li>Keep the logo simple and readable at small sizes</li>
              <li>Horizontal logos work best for headers</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
