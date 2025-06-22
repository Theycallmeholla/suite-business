'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/lib/toast';

interface UsePageContentProps {
  pageId: string;
  initialSections: any[];
}

export function usePageContent({ pageId, initialSections }: UsePageContentProps) {
  const [sections, setSections] = useState(initialSections);
  const [isSaving, setIsSaving] = useState(false);

  const updateSection = useCallback(async (sectionId: string, updates: any) => {
    // Deep merge function for nested updates
    const deepMerge = (target: any, source: any): any => {
      const output = { ...target };
      for (const key in source) {
        if (source[key] instanceof Object && key in target) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    };

    // Optimistically update the UI
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, data: deepMerge(section.data, updates) }
        : section
    );
    setSections(updatedSections);

    // Save to database
    setIsSaving(true);
    try {
      const response = await fetch('/api/pages/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          sections: updatedSections,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      toast.success('Changes saved');
    } catch (error) {
      // Revert on error
      setSections(sections);
      toast.error('Failed to save changes');
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [pageId, sections]);

  const updateSectionField = useCallback(async (
    sectionId: string, 
    fieldPath: string, 
    value: any
  ) => {
    // Build the update object with nested path support
    const pathParts = fieldPath.split('.');
    const updates = pathParts.reduceRight((acc, part) => ({ [part]: acc }), value);
    
    return updateSection(sectionId, updates);
  }, [updateSection]);

  return {
    sections,
    updateSection,
    updateSectionField,
    isSaving,
  };
}
