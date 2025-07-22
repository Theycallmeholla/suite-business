'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TemplateConfig } from '@/types/template-system';
import { getSectionComponent } from '@/lib/template-registry';
import { Site } from '@prisma/client';
import { Section } from '@/types/site-builder';

interface EnhancedTemplateRendererProps {
  template: TemplateConfig;
  site: Site & {
    content?: any;
    settings?: any;
    pages?: any[];
  };
  sections?: Section[];
  isEditable?: boolean;
}

/**
 * Maps data-driven sections to template component data format
 */
function mapSectionDataToTemplateFormat(section: Section, siteData: any) {
  switch (section.type) {
    case 'hero':
      return {
        title: section.data.headline,
        subtitle: section.data.subheadline,
        description: section.data.description,
        features: section.data.features || [],
        ctaText: section.data.primaryButton?.text,
        ctaLink: section.data.primaryButton?.href,
        secondaryCtaText: section.data.secondaryButton?.text,
        secondaryCtaLink: section.data.secondaryButton?.href,
        image: section.data.backgroundImage,
        formTitle: 'Get Free Quote',
        formSubtitle: 'Transform your space today'
      };
      
    case 'services':
      return {
        title: section.data.title,
        subtitle: section.data.subtitle,
        services: section.data.services.map((service: any) => ({
          title: service.name,
          description: service.description,
          price: service.price,
          image: service.image,
          features: service.features || [],
          icon: service.icon
        }))
      };
      
    case 'about':
      return {
        title: section.data.title,
        content: section.data.content,
        description: section.data.content,
        image: section.data.image,
        stats: section.data.stats,
        highlights: section.data.highlights,
        features: section.data.highlights
      };
      
    case 'testimonials':
      return {
        title: section.data.title,
        subtitle: section.data.subtitle,
        testimonials: section.data.testimonials?.map((t: any) => ({
          content: t.text,
          author: t.author,
          role: t.position,
          rating: t.rating,
          image: t.image
        })) || []
      };
      
    case 'cta':
      return {
        title: section.data.headline,
        subtitle: section.data.description,
        ctaText: section.data.buttonText,
        ctaLink: section.data.buttonHref,
        backgroundImage: section.data.backgroundImage
      };
      
    case 'contact':
      return {
        title: section.data.title,
        subtitle: section.data.subtitle,
        phone: siteData.phone,
        email: siteData.email,
        address: siteData.address ? `${siteData.address}, ${siteData.city}, ${siteData.state} ${siteData.zip}` : '',
        hours: siteData.businessHours
      };
      
    default:
      return section.data;
  }
}

export default function EnhancedTemplateRenderer({ 
  template, 
  site, 
  sections,
  isEditable = false 
}: EnhancedTemplateRendererProps) {
  // Get sections from either passed prop or site content
  const dataDrivenSections = sections || site.content?.sections || [];
  
  // Create a map of section types to data
  const sectionDataMap = dataDrivenSections.reduce((acc: any, section: Section) => {
    acc[section.type] = mapSectionDataToTemplateFormat(section, site);
    return acc;
  }, {});
  
  // Function to select the best variant for a section
  const selectVariant = (sectionType: string) => {
    const variants = template.sections[sectionType];
    if (!variants || variants.length === 0) return null;
    
    // For now, select the first variant
    // In the future, this could be more sophisticated
    return variants[0];
  };
  
  // Render a section
  const renderSection = (sectionType: string) => {
    const variant = selectVariant(sectionType);
    if (!variant) return null;
    
    // Get section data
    const sectionData = sectionDataMap[sectionType] || {};
    
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
  
  // Define section order based on what sections we have data for
  const sectionOrder = ['hero', 'services', 'about', 'portfolio', 'testimonials', 'cta', 'contact']
    .filter(type => sectionDataMap[type] && template.sections[type]);
  
  return (
    <div className="template-renderer">
      {sectionOrder.map(sectionType => renderSection(sectionType))}
    </div>
  );
}

// Loading component for sections
function SectionLoader() {
  return (
    <div className="min-h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse" />
  );
}