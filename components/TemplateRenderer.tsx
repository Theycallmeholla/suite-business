'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TemplateConfig } from '@/types/template-system';
import { getSectionComponent } from '@/lib/template-registry';
import { Site } from '@prisma/client';

interface TemplateRendererProps {
  template: TemplateConfig;
  site: Site & {
    content?: any;
    settings?: any;
  };
  isEditable?: boolean;
}

interface SectionData {
  [key: string]: any;
}

export default function TemplateRenderer({ template, site, isEditable = false }: TemplateRendererProps) {
  const content = site.content || {};
  const settings = site.settings || {};
  
  // Function to select the best variant for a section
  const selectVariant = (sectionType: string) => {
    const variants = template.sections[sectionType];
    if (!variants || variants.length === 0) return null;
    
    // For now, select the first variant that meets requirements
    // In the future, this could be more sophisticated
    for (const variant of variants) {
      // Check if required content exists
      if (variant.requiresContent) {
        const hasAllContent = variant.requiresContent.every(field => 
          content[sectionType]?.[field] || content[field]
        );
        if (!hasAllContent) continue;
      }
      
      // Check minimum items
      if (variant.minItems) {
        const items = content[sectionType]?.items || content[`${sectionType}Items`] || [];
        if (items.length < variant.minItems) continue;
      }
      
      // Check if images are required
      if (variant.requiresImage && !content[sectionType]?.image) continue;
      if (variant.requiresVideo && !content[sectionType]?.video) continue;
      
      return variant;
    }
    
    // Return first variant as fallback
    return variants[0];
  };
  
  // Render a section
  const renderSection = (sectionType: string) => {
    const variant = selectVariant(sectionType);
    if (!variant) return null;
    
    // Prepare section data
    const sectionData: SectionData = {
      ...content[sectionType],
      ...content, // Include root-level content as fallback
    };
    
    // Dynamic import of the section component
    const SectionComponent = dynamic(
      () => getSectionComponent(variant.id).then(comp => comp ? { default: comp } : { default: () => null }),
      {
        loading: () => <SectionLoader />,
        ssr: true
      }
    );
    
    return (
      <Suspense key={sectionType} fallback={<SectionLoader />}>
        <SectionComponent
          data={sectionData}
          siteId={site.id}
          isEditable={isEditable}
        />
      </Suspense>
    );
  };
  
  // Define section order
  const sectionOrder = [
    'hero',
    'services',
    'portfolio',
    'about',
    'testimonials',
    'cta',
    'contact'
  ];
  
  return (
    <div className="template-renderer">
      {sectionOrder.map(sectionType => {
        // Check if template has this section type
        if (!template.sections[sectionType]) return null;
        return renderSection(sectionType);
      })}
    </div>
  );
}

// Loading component for sections
function SectionLoader() {
  return (
    <div className="min-h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse" />
  );
}