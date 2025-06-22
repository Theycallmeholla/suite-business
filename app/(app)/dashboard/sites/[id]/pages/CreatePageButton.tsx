'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { generateDefaultSections } from '@/lib/site-builder';

interface CreatePageButtonProps {
  siteId: string;
  pageType: string;
  siteData: any;
}

export function CreatePageButton({ siteId, pageType, siteData }: CreatePageButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePage = async () => {
    setIsCreating(true);
    
    try {
      // Generate default sections for this page type
      const sections = generateDefaultSections(siteData, pageType);
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          type: pageType,
          slug: pageType === 'home' ? '' : pageType,
          title: getPageTitle(pageType),
          content: { sections },
        }),
      });

      const data = await response.json();
      
      if (!response.ok && response.status !== 400) {
        throw new Error(data.error || 'Failed to create page');
      }

      // If page already exists (400), we still have the page data
      const pageId = data.page.id;
      
      toast.success(
        response.status === 400 
          ? 'Page already exists. Opening editor...' 
          : 'Page created successfully!'
      );
      
      // Redirect to preview/edit mode
      router.push(`/preview/${siteId}?pageId=${pageId}`);
    } catch (error) {
      toast.error('Failed to create page');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleCreatePage}
      disabled={isCreating}
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </>
      )}
    </Button>
  );
}

function getPageTitle(type: string): string {
  const titles: Record<string, string> = {
    home: 'Home',
    about: 'About Us',
    services: 'Our Services',
    contact: 'Contact Us',
  };
  
  return titles[type] || type.charAt(0).toUpperCase() + type.slice(1);
}