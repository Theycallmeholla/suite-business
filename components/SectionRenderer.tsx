import { Section } from '@/types/site-builder';
import { SiteWithPages } from '@/lib/site-data';
import * as SectionComponents from './site-sections';

interface SectionRendererProps {
  sections: Section[];
  siteData: SiteWithPages;
}

export function SectionRenderer({ sections, siteData }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => {
        if (!section.visible) return null;

        switch (section.type) {
          case 'hero':
            return (
              <SectionComponents.Hero
                key={section.id}
                section={section}
                siteData={siteData}
              />
            );
          case 'about':
            return (
              <SectionComponents.About
                key={section.id}
                section={section}
                siteData={siteData}
              />
            );
          case 'services':
            return (
              <SectionComponents.Services
                key={section.id}
                section={section}
                siteData={siteData}
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
              <SectionComponents.Contact
                key={section.id}
                section={section}
                siteData={siteData}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
