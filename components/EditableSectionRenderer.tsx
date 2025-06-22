'use client';

import { Section } from '@/types/site-builder';
import { SiteWithPages } from '@/lib/site-data';
import * as SectionComponents from './site-sections';

import { useEditMode } from '@/contexts/EditModeContext';

interface EditableSectionRendererProps {
  sections: Section[];
  siteData: SiteWithPages;
  onUpdateSection: (sectionId: string, fieldPath: string, value: any) => Promise<void>;
}

export function EditableSectionRenderer({ 
  sections, 
  siteData, 
  onUpdateSection 
}: EditableSectionRendererProps) {
  const { isEditMode } = useEditMode();

  return (
    <>
      {sections.map((section) => {
        if (!section.visible) return null;

        const handleUpdate = (fieldPath: string, value: any) => 
          onUpdateSection(section.id, fieldPath, value);

        switch (section.type) {
          case 'hero':
            return (
              <SectionComponents.Hero
                key={section.id}
                section={section}
                siteData={siteData}
                onUpdate={isEditMode ? handleUpdate : undefined}
                isEditable={isEditMode}
              />
            );
          case 'about':
            return (
              <SectionComponents.About
                key={section.id}
                section={section}
                siteData={siteData}
                onUpdate={isEditMode ? handleUpdate : undefined}
                isEditable={isEditMode}
              />
            );
          case 'services':
            return (
              <SectionComponents.Services
                key={section.id}
                section={section}
                siteData={siteData}
                onUpdate={isEditMode ? handleUpdate : undefined}
                isEditable={isEditMode}
              />
            );
          case 'features':
            return (
              <SectionComponents.Features
                key={section.id}
                section={section}
                siteData={siteData}
              />
            );
          case 'cta':
            return (
              <SectionComponents.CTA
                key={section.id}
                section={section}
                siteData={siteData}
              />
            );
          case 'contact':
            return (
              <SectionComponents.ContactSection
                key={section.id}
                section={section}
                siteData={siteData}
                onUpdate={isEditMode ? handleUpdate : undefined}
                isEditable={isEditMode}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
