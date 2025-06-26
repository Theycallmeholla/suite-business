'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { EditableSectionRenderer } from '@/components/EditableSectionRenderer';
import { usePageContent } from '@/hooks/usePageContent';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { generateDefaultSections } from '@/lib/site-builder';
import { SaveIndicator } from './SaveIndicator';
import { toast } from '@/lib/toast';


interface PreviewContentProps {
  site: any; // Site with pages, services, photos
  initialSections: any[];
  pageId?: string;
}

function PreviewContentInner({ site, initialSections, pageId }: PreviewContentProps) {
  const [sections, setSections] = useState(initialSections);
  const [currentPageId, setCurrentPageId] = useState(pageId);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // Ensure we have a page ID to work with
    const ensurePageExists = async () => {
      if (!currentPageId) {
        // Create a home page if it doesn't exist
        try {
          const response = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siteId: site.id,
              type: 'home',
              slug: '',
              title: 'Home',
              content: { sections: initialSections }
            }),
          });

          if (response.ok) {
            const { page } = await response.json();
            setCurrentPageId(page.id);
          }
        } catch (error) {
          // Error will be logged server-side
        }
      }
    };

    ensurePageExists();
  }, [currentPageId, site.id, initialSections]);

  const { sections: managedSections, updateSectionField, isSaving } = usePageContent({ 
    pageId: currentPageId || '', 
    initialSections: sections 
  });

  // Use managed sections if we have a pageId, otherwise use initial sections
  const displaySections = currentPageId ? managedSections : sections;

  const handleUpdateSection = async (sectionId: string, fieldPath: string, value: any) => {
    if (!currentPageId) {
      toast.error('Please wait for page to load');
      return;
    }
    
    setSaveStatus('saving');
    
    try {
      await updateSectionField(sectionId, fieldPath, value);
      setSaveStatus('saved');
      // Auto-hide saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      toast.error('Failed to save changes');
      setSaveStatus('error');
    }
  };

  return (
    <>
      {/* Simple header */}
      <header className="sticky top-16 w-full z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {site.logo ? (
                <img src={site.logo} alt={site.businessName} className="h-8" />
              ) : (
                <h1 className="text-xl font-bold" style={{ color: site.primaryColor }}>
                  {site.businessName}
                </h1>
              )}
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="hover:text-gray-600">Services</a>
              <a href="#about" className="hover:text-gray-600">About</a>
              <a href="#contact" className="hover:text-gray-600">Contact</a>
              {site.phone && (
                <a 
                  href={`tel:${site.phone}`}
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: site.primaryColor }}
                >
                  <Phone className="w-4 h-4" />
                  {site.phone}
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <EditableSectionRenderer 
          sections={displaySections} 
          siteData={site}
          onUpdateSection={handleUpdateSection}
        />
      </main>

      {/* Simple footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-semibold">{site.businessName}</p>
              {site.address && (
                <p className="text-sm text-gray-400">
                  {site.address}, {site.city}, {site.state} {site.zip}
                </p>
              )}
            </div>
            
            <div className="text-center md:text-right">
              {site.phone && (
                <p className="text-sm">
                  Call: <a href={`tel:${site.phone}`} className="hover:underline">{site.phone}</a>
                </p>
              )}
              {site.email && (
                <p className="text-sm">
                  Email: <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {site.businessName}. All rights reserved.</p>
            <p className="mt-2">
              Powered by{' '}
              <Link href="https://suitebusiness.com" className="hover:text-white">
                SiteBango
              </Link>
            </p>
          </div>
        </div>
      </footer>
      
      {/* Save indicator */}
      <SaveIndicator status={saveStatus} />
    </>
  );
}

export default function PreviewContent(props: PreviewContentProps) {
  return (
    <EditModeProvider>
      <PreviewContentInner {...props} />
    </EditModeProvider>
  );
}
