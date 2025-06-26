import { TemplateConfig } from '@/types/template-system';
import { dreamGardenConfig } from '@/templates/dream-garden/config';
import { naturePremiumTemplate } from '@/templates/nature-premium/config';
import { emeraldEleganceTemplate } from '@/templates/emerald-elegance/config';
import { artistryMinimalTemplate } from '@/templates/artistry-minimal/config';

// Template registry - all available templates
export const templateRegistry: TemplateConfig[] = [
  dreamGardenConfig,
  naturePremiumTemplate,
  emeraldEleganceTemplate,
  artistryMinimalTemplate
];

// Get template by ID
export function getTemplateById(templateId: string): TemplateConfig | undefined {
  return templateRegistry.find(t => t.id === templateId);
}

// Get default template for an industry
export function getDefaultTemplateForIndustry(industry: string): TemplateConfig {
  // First try to find a template that includes this industry
  const industryTemplate = templateRegistry.find(t => 
    t.compatibility.industries.include?.includes(industry)
  );
  
  if (industryTemplate) return industryTemplate;
  
  // For landscaping-related industries, use dream-garden as default
  const landscapingIndustries = ['landscaping', 'gardening', 'lawn-care', 'tree-service'];
  if (landscapingIndustries.includes(industry)) {
    return dreamGardenConfig;
  }
  
  // Default to first template if no match
  return templateRegistry[0];
}

// Component imports for each template's sections
export const sectionComponents = {
  // Dream Garden template sections
  'hero-dream-parallax': () => import('@/templates/dream-garden/sections/Hero/HeroDreamParallax'),
  'services-dream-cards': () => import('@/templates/dream-garden/sections/Services/ServicesDreamCards'),
  
  // Nature Premium template sections
  'hero-nature-seasonal': () => import('@/templates/nature-premium/sections/Hero/HeroNatureSeasonal'),
  'services-nature-modal': () => import('@/templates/nature-premium/sections/Services/ServicesNatureModal'),
  'portfolio-nature-slider': () => import('@/templates/nature-premium/sections/Portfolio/PortfolioNatureSlider'),
  
  // Emerald Elegance template sections
  'hero-emerald-form': () => import('@/templates/emerald-elegance/sections/Hero/HeroEmeraldForm'),
  'services-emerald-alternating': () => import('@/templates/emerald-elegance/sections/Services/ServicesEmeraldAlternating'),
  'portfolio-emerald-slider': () => import('@/templates/emerald-elegance/sections/Portfolio/PortfolioEmeraldSlider'),
  'about-emerald-botanical': () => import('@/templates/emerald-elegance/sections/About/AboutEmeraldBotanical'),
  'testimonials-emerald-auto': () => import('@/templates/emerald-elegance/sections/Testimonials/TestimonialsEmeraldAuto'),
  'faq-emerald-accordion': () => import('@/templates/emerald-elegance/sections/FAQ/FaqEmeraldAccordion'),
  'cta-emerald-decorated': () => import('@/templates/emerald-elegance/sections/CTA/CtaEmeraldDecorated'),
  'contact-emerald-split': () => import('@/templates/emerald-elegance/sections/Contact/ContactEmeraldSplit'),
  
  // Artistry Minimal template sections
  'hero-artistry-minimal': () => import('@/templates/artistry-minimal/sections/Hero/HeroArtistryMinimal'),
  'services-artistry-grid': () => import('@/templates/artistry-minimal/sections/Services/ServicesArtistryGrid'),
  'portfolio-artistry-masonry': () => import('@/templates/artistry-minimal/sections/Portfolio/PortfolioArtistryMasonry'),
  'testimonials-artistry-grid': () => import('@/templates/artistry-minimal/sections/Testimonials/TestimonialsArtistryGrid'),
  'about-artistry-split': () => import('@/templates/artistry-minimal/sections/About/AboutArtistrySplit'),
  'contact-artistry-cards': () => import('@/templates/artistry-minimal/sections/Contact/ContactArtistryCards'),
  
  // Add more section imports as templates are created
};

// Get component for a specific section variant
export async function getSectionComponent(variantId: string) {
  const loader = sectionComponents[variantId as keyof typeof sectionComponents];
  if (!loader) {
    console.warn(`No component found for variant: ${variantId}`);
    return null;
  }
  
  const module = await loader();
  return module.default;
}