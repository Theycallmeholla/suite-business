import { 
  TemplateConfig, 
  BusinessData, 
  TemplateScore, 
  RequirementCheckResult,
  SectionVariantConfig 
} from '@/types/template-system';

/**
 * Calculate compatibility score for a template based on business data
 */
export function calculateTemplateScore(
  template: TemplateConfig, 
  business: BusinessData
): TemplateScore {
  let score = 0;
  const reasons = {
    industryMatch: false,
    keywordScore: 0,
    requirementsMet: false,
    missingRequirements: [] as string[]
  };

  // Check industry compatibility (pass/fail)
  const industryCheck = checkIndustryCompatibility(template, business);
  if (!industryCheck) {
    return { template, score: 0, reasons };
  }
  reasons.industryMatch = true;
  score += 30;

  // Calculate keyword score (0-40 points)
  const keywordScore = calculateKeywordScore(template, business);
  reasons.keywordScore = keywordScore;
  score += keywordScore;

  // Check requirements (pass/fail + bonus points)
  const requirementsCheck = checkTemplateRequirements(template, business);
  if (!requirementsCheck.meets) {
    reasons.missingRequirements = requirementsCheck.missing;
    // Don't completely disqualify, but heavily penalize
    score = Math.max(0, score - 50);
  } else {
    reasons.requirementsMet = true;
    score += 30;
  }

  return { template, score, reasons };
}

/**
 * Check if template is compatible with business industry
 */
function checkIndustryCompatibility(
  template: TemplateConfig, 
  business: BusinessData
): boolean {
  const { include, exclude } = template.compatibility.industries;
  
  // Check exclusions first
  if (exclude && exclude.includes(business.industry.toLowerCase())) {
    return false;
  }
  
  // If includes is specified, industry must be in the list
  if (include && include.length > 0) {
    return include.includes(business.industry.toLowerCase());
  }
  
  // No restrictions
  return true;
}

/**
 * Calculate keyword matching score
 */
function calculateKeywordScore(
  template: TemplateConfig, 
  business: BusinessData
): number {
  const { positive = [], negative = [] } = template.compatibility.keywords;
  let score = 20; // Base score
  
  // Combine all business text for keyword matching
  const businessText = [
    business.businessName,
    business.tagline,
    business.description,
    ...(business.styleKeywords || []),
    business.industry
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Check negative keywords (instant disqualification)
  for (const keyword of negative) {
    if (businessText.includes(keyword.toLowerCase())) {
      return 0;
    }
  }
  
  // Check positive keywords (bonus points)
  let matches = 0;
  for (const keyword of positive) {
    if (businessText.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  
  // Scale score based on matches (up to 40 points total)
  if (positive.length > 0) {
    const matchRatio = matches / positive.length;
    score += Math.round(matchRatio * 20);
  }
  
  return score;
}

/**
 * Check if business meets template requirements
 */
function checkTemplateRequirements(
  template: TemplateConfig,
  business: BusinessData
): RequirementCheckResult {
  const missing: string[] = [];
  
  // Check color requirements
  const { colors } = template.requirements;
  if (colors) {
    const businessColors = business.colorScheme;
    let colorCount = 0;
    if (businessColors?.primary) colorCount++;
    if (businessColors?.secondary) colorCount++;
    if (businessColors?.accent) colorCount++;
    
    if (colors.primary && !businessColors?.primary) {
      missing.push('Primary color is required');
    }
    if (colors.secondary && !businessColors?.secondary) {
      missing.push('Secondary color is required');
    }
    if (colors.accent && !businessColors?.accent) {
      missing.push('Accent color is required');
    }
    if (colors.minimumCount && colorCount < colors.minimumCount) {
      missing.push(`At least ${colors.minimumCount} colors required`);
    }
  }
  
  // Check content requirements
  const { content } = template.requirements;
  if (content) {
    if (content.businessName && !business.businessName) {
      missing.push('Business name is required');
    }
    if (content.tagline && !business.tagline) {
      missing.push('Tagline is required');
    }
    if (content.description?.required && !business.description) {
      missing.push('Business description is required');
    }
    if (content.description?.minLength && business.description) {
      if (business.description.length < content.description.minLength) {
        missing.push(`Description must be at least ${content.description.minLength} characters`);
      }
    }
    
    // Check services
    if (content.services && business.services && business.services.length < content.services.min) {
      missing.push(`At least ${content.services.min} services required`);
    }
  }
  
  // Check media requirements
  const { media } = template.requirements;
  if (media) {
    if (media.logo && !business.logo) {
      missing.push('Logo is required');
    }
    if (media.heroImage && !business.images?.hero) {
      missing.push('Hero image is required');
    }
    if (media.galleryImages && business.images?.gallery) {
      if (business.images.gallery.length < media.galleryImages.min) {
        missing.push(`At least ${media.galleryImages.min} gallery images required`);
      }
    }
  }
  
  return {
    meets: missing.length === 0,
    missing
  };
}

/**
 * Get compatible templates for a business, sorted by score
 */
export function getCompatibleTemplates(
  templates: TemplateConfig[],
  business: BusinessData,
  threshold = 50
): TemplateScore[] {
  const scores = templates
    .map(template => calculateTemplateScore(template, business))
    .filter(result => result.score >= threshold)
    .sort((a, b) => b.score - a.score);
  
  return scores;
}

/**
 * Check if section variant requirements are met
 */
export function checkSectionRequirements(
  variant: SectionVariantConfig,
  business: BusinessData
): RequirementCheckResult {
  const missing: string[] = [];
  const { requires } = variant;
  
  // Check content requirements
  if (requires.content) {
    if (requires.content.title && !business.businessName) {
      missing.push('Title content required');
    }
    if (requires.content.subtitle && !business.tagline) {
      missing.push('Subtitle content required');
    }
    if (requires.content.description) {
      const desc = business.description || '';
      if (requires.content.description.minLength && desc.length < requires.content.description.minLength) {
        missing.push(`Description must be at least ${requires.content.description.minLength} characters`);
      }
    }
  }
  
  // Check media requirements
  if (requires.media) {
    if (requires.media.image) {
      const imageReq = typeof requires.media.image === 'boolean' 
        ? { min: 1 } 
        : requires.media.image;
      
      const totalImages = (business.images.gallery?.length || 0) + 
                         (business.images.hero ? 1 : 0);
      
      if (totalImages < (imageReq.min || 1)) {
        missing.push(`At least ${imageReq.min || 1} image(s) required`);
      }
    }
  }
  
  // Check data requirements
  if (requires.data) {
    if (requires.data.services) {
      if (business.services.length < requires.data.services.min) {
        missing.push(`At least ${requires.data.services.min} services required`);
      }
    }
    if (requires.data.testimonials) {
      const testimonialCount = business.testimonials?.length || 0;
      if (testimonialCount < requires.data.testimonials.min) {
        missing.push(`At least ${requires.data.testimonials.min} testimonials required`);
      }
    }
  }
  
  return {
    meets: missing.length === 0,
    missing
  };
}

/**
 * Get available section variants for a template based on business data
 */
export function getAvailableSections(
  template: TemplateConfig,
  business: BusinessData
): Record<string, SectionVariantConfig[]> {
  const availableSections: Record<string, SectionVariantConfig[]> = {};
  
  Object.entries(template.sections).forEach(([sectionType, variants]) => {
    availableSections[sectionType] = variants.filter(variant => {
      const check = checkSectionRequirements(variant, business);
      return check.meets;
    });
  });
  
  return availableSections;
}

/**
 * Automatically select best template for business
 */
export function autoSelectTemplate(
  templates: TemplateConfig[],
  business: BusinessData
): TemplateConfig | null {
  const compatible = getCompatibleTemplates(templates, business);
  return compatible.length > 0 ? compatible[0].template : null;
}

/**
 * Select best variant for each section type
 */
export function selectSectionVariants(
  template: TemplateConfig,
  business: BusinessData
): Record<string, SectionVariantConfig> {
  const available = getAvailableSections(template, business);
  const selected: Record<string, SectionVariantConfig> = {};
  
  Object.entries(available).forEach(([sectionType, variants]) => {
    if (variants.length > 0) {
      // For now, select first available variant
      // In future, could score variants based on content density match
      selected[sectionType] = variants[0];
    }
  });
  
  return selected;
}