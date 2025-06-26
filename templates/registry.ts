import { TemplateConfig } from '@/types/template-system';
import { modernTechConfig } from './modern-tech/config';
import { classicBusinessConfig } from './classic-business/config';
import { dreamGardenConfig } from './dream-garden/config';

// Template registry - add new templates here
export const templates: Record<string, TemplateConfig> = {
  'modern-tech': modernTechConfig,
  'classic-business': classicBusinessConfig,
  'dream-garden': dreamGardenConfig,
  // Future templates:
  // 'playful-creative': playfulCreativeConfig,
  // 'minimal-clean': minimalCleanConfig,
  // 'bold-impact': boldImpactConfig,
};

// Get all templates as array
export function getAllTemplates(): TemplateConfig[] {
  return Object.values(templates);
}

// Get template by ID
export function getTemplateById(id: string): TemplateConfig | null {
  return templates[id] || null;
}

// Get templates for specific industry
export function getTemplatesForIndustry(industry: string): TemplateConfig[] {
  return getAllTemplates().filter(template => {
    const { include, exclude } = template.compatibility.industries;
    
    // Check if excluded
    if (exclude?.includes(industry.toLowerCase())) {
      return false;
    }
    
    // Check if included (or no restrictions)
    if (!include || include.length === 0) {
      return true;
    }
    
    return include.includes(industry.toLowerCase());
  });
}

// Industry to template suggestions (for quick defaults)
export const industryDefaults: Record<string, string> = {
  // Tech industries
  'technology': 'modern-tech',
  'software': 'modern-tech',
  'saas': 'modern-tech',
  'startup': 'modern-tech',
  
  // Professional services
  'law': 'classic-business',
  'accounting': 'classic-business',
  'insurance': 'classic-business',
  'medical': 'classic-business',
  'dental': 'classic-business',
  
  // Home services - varies by business style
  'landscaping': 'dream-garden',  // Perfect match for landscaping businesses
  'gardening': 'dream-garden',
  'lawn-care': 'dream-garden',
  'plumbing': 'classic-business',
  'electrical': 'classic-business',
  'hvac': 'modern-tech',  // HVAC often more tech-forward
  
  // Creative industries (when added)
  // 'design': 'playful-creative',
  // 'photography': 'minimal-clean',
  // 'marketing': 'bold-impact',
};

// Get suggested template for industry
export function getSuggestedTemplate(industry: string): string | null {
  return industryDefaults[industry.toLowerCase()] || null;
}