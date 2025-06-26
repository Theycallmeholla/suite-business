/**
 * Adaptive Template Engine
 * 
 * Main orchestrator that combines:
 * - Dynamic Layout Generator
 * - Section Variants System  
 * - Design System Generator
 * - Question Answers from the conversational flow
 * 
 * This creates truly unique websites where no two sites look the same,
 * even for businesses in the same industry.
 */

import { BusinessIntelligenceData } from '@/types/intelligence';
import { IndustryType } from '@/types/site-builder';
import { 
  DynamicLayoutGenerator, 
  QuestionAnswers, 
  DynamicLayout 
} from './dynamic-layout-generator';
import { 
  DesignSystemGenerator, 
  DesignSystem 
} from './design-system-generator';
import { 
  findBestVariant, 
  SectionVariant 
} from './section-variants';

export interface AdaptiveTemplate {
  id: string;
  name: string;
  layout: DynamicLayout;
  designSystem: DesignSystem;
  sectionVariants: Record<string, SectionVariant>;
  metadata: {
    uniquenessScore: number;
    conversionOptimized: boolean;
    generatedAt: Date;
    basedOn: {
      answers: QuestionAnswers;
      businessData: BusinessIntelligenceData;
      industry: IndustryType;
    };
  };
}

export interface TemplateGenerationOptions {
  prioritizeConversion?: boolean;
  emphasizeUniqueness?: boolean;
  mobileFirst?: boolean;
  performanceOptimized?: boolean;
}

/**
 * Main adaptive template engine
 */
export class AdaptiveTemplateEngine {
  private layoutGenerator: DynamicLayoutGenerator;
  private designGenerator: DesignSystemGenerator;

  constructor() {
    this.layoutGenerator = new DynamicLayoutGenerator();
    this.designGenerator = new DesignSystemGenerator();
  }

  /**
   * Generate a complete adaptive template
   */
  async generateTemplate(
    answers: QuestionAnswers,
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    options: TemplateGenerationOptions = {}
  ): Promise<AdaptiveTemplate> {
    // Analyze business personality and requirements
    const personality = this.analyzeBrandPersonality(answers);
    const contentDensity = this.calculateContentDensity(businessData);
    
    // Generate dynamic layout
    const layout = this.layoutGenerator.generateLayout(
      answers,
      businessData,
      industry
    );
    
    // Generate design system
    const designSystem = this.designGenerator.generateDesignSystem(
      personality,
      industry,
      answers,
      contentDensity
    );
    
    // Select best variants for each section
    const sectionVariants = this.selectSectionVariants(
      layout,
      personality,
      industry,
      contentDensity,
      businessData
    );
    
    // Optimize for conversion if requested
    if (options.prioritizeConversion) {
      this.optimizeForConversion(layout, sectionVariants, answers);
    }
    
    // Calculate uniqueness score
    const uniquenessScore = this.calculateUniquenessScore(
      layout,
      designSystem,
      sectionVariants
    );

    return {
      id: this.generateTemplateId(personality, industry),
      name: this.generateTemplateName(personality, industry, businessData),
      layout,
      designSystem,
      sectionVariants,
      metadata: {
        uniquenessScore,
        conversionOptimized: options.prioritizeConversion || false,
        generatedAt: new Date(),
        basedOn: {
          answers,
          businessData,
          industry,
        },
      },
    };
  }

  /**
   * Generate multiple template variations for A/B testing
   */
  async generateVariations(
    answers: QuestionAnswers,
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    count: number = 3
  ): Promise<AdaptiveTemplate[]> {
    const variations: AdaptiveTemplate[] = [];
    
    // Generate base template
    const baseTemplate = await this.generateTemplate(answers, businessData, industry);
    variations.push(baseTemplate);
    
    // Generate variations with different emphases
    for (let i = 1; i < count; i++) {
      const variationAnswers = this.createVariationAnswers(answers, i);
      const variation = await this.generateTemplate(
        variationAnswers,
        businessData,
        industry,
        { prioritizeConversion: i === 1, emphasizeUniqueness: i === 2 }
      );
      variations.push(variation);
    }
    
    return variations;
  }

  /**
   * Optimize existing template based on performance data
   */
  optimizeTemplate(
    template: AdaptiveTemplate,
    performanceData: {
      conversionRate: number;
      bounceRate: number;
      timeOnPage: number;
      userFeedback?: string[];
    }
  ): AdaptiveTemplate {
    // Clone the template
    const optimized = { ...template };
    
    // Apply optimizations based on performance data
    if (performanceData.bounceRate > 0.7) {
      // High bounce rate - simplify layout
      optimized.layout = this.simplifyLayout(optimized.layout);
    }
    
    if (performanceData.conversionRate < 0.02) {
      // Low conversion - enhance CTAs
      optimized.layout = this.enhanceCallsToAction(optimized.layout);
    }
    
    if (performanceData.timeOnPage < 30) {
      // Low engagement - add more engaging elements
      optimized.layout = this.addEngagementElements(optimized.layout);
    }
    
    return optimized;
  }

  /**
   * Convert template to CSS/HTML structure
   */
  renderTemplate(template: AdaptiveTemplate): {
    css: string;
    structure: any;
    components: Record<string, any>;
  } {
    const css = this.generateCSS(template.designSystem);
    const structure = this.generateStructure(template.layout);
    const components = this.generateComponents(template.sectionVariants);
    
    return {
      css,
      structure,
      components,
    };
  }

  /**
   * Analyze brand personality from answers
   */
  private analyzeBrandPersonality(answers: QuestionAnswers): string {
    // Analyze answers to determine brand personality
    if (answers.differentiators?.includes('premium') || answers.differentiators?.includes('luxury')) {
      return 'premium';
    }
    if (answers.differentiators?.includes('family-owned') || answers.businessStage === '10+') {
      return 'traditional';
    }
    if (answers.differentiators?.includes('innovative') || answers.differentiators?.includes('tech-forward')) {
      return 'modern';
    }
    if (answers.emergencyService || answers.differentiators?.includes('fast')) {
      return 'urgent';
    }
    if (answers.differentiators?.includes('elegant') || answers.differentiators?.includes('sophisticated')) {
      return 'elegant';
    }
    
    return 'professional'; // Default
  }

  /**
   * Calculate content density
   */
  private calculateContentDensity(businessData: BusinessIntelligenceData): 'minimal' | 'moderate' | 'rich' {
    let score = 0;
    
    if (businessData.gbp?.description && businessData.gbp.description.length > 100) score++;
    if (businessData.gbp?.photos && businessData.gbp.photos.length > 3) score++;
    if (businessData.gbp?.reviews && businessData.gbp.reviews.count > 10) score++;
    if (businessData.gbp?.services && businessData.gbp.services.length > 3) score++;
    if (businessData.manual?.certifications && businessData.manual.certifications.length > 0) score++;
    
    if (score >= 4) return 'rich';
    if (score >= 2) return 'moderate';
    return 'minimal';
  }

  /**
   * Select best section variants
   */
  private selectSectionVariants(
    layout: DynamicLayout,
    personality: string,
    industry: IndustryType,
    contentDensity: 'minimal' | 'moderate' | 'rich',
    businessData: BusinessIntelligenceData
  ): Record<string, SectionVariant> {
    const variants: Record<string, SectionVariant> = {};
    
    layout.sections.forEach(section => {
      const variant = findBestVariant(section.type, {
        personality,
        industry,
        contentDensity,
        availableContent: businessData,
      });
      
      if (variant) {
        variants[section.id] = variant;
      }
    });
    
    return variants;
  }

  /**
   * Optimize layout for conversion
   */
  private optimizeForConversion(
    layout: DynamicLayout,
    variants: Record<string, SectionVariant>,
    answers: QuestionAnswers
  ): void {
    // Move high-converting sections higher
    layout.sections.sort((a, b) => {
      const conversionPriority = {
        hero: 1,
        'trust-bar': 2,
        services: 3,
        cta: 4,
        testimonials: 5,
        contact: 6,
      };
      
      const aPriority = conversionPriority[a.type as keyof typeof conversionPriority] || 10;
      const bPriority = conversionPriority[b.type as keyof typeof conversionPriority] || 10;
      
      return aPriority - bPriority;
    });
    
    // Enhance CTAs based on industry
    layout.sections.forEach(section => {
      if (section.type === 'hero' || section.type === 'cta') {
        section.styling.emphasis = 'bold';
        section.props.ctaSize = 'large';
      }
    });
  }

  /**
   * Calculate uniqueness score
   */
  private calculateUniquenessScore(
    layout: DynamicLayout,
    designSystem: DesignSystem,
    variants: Record<string, SectionVariant>
  ): number {
    let score = 0;
    
    // Layout uniqueness (30 points)
    const uniqueSections = layout.sections.filter(s => s.variant !== 'default').length;
    score += Math.min(30, uniqueSections * 5);
    
    // Design system uniqueness (40 points)
    if (designSystem.colors.primary !== '#3B82F6') score += 10; // Non-default primary
    if (designSystem.typography.headingFont.family !== 'Inter') score += 10; // Custom font
    if (designSystem.visual.borderRadius.md !== '8px') score += 10; // Custom radius
    if (designSystem.spacing.unit !== 16) score += 10; // Custom spacing
    
    // Section variant uniqueness (30 points)
    const variantCount = Object.keys(variants).length;
    score += Math.min(30, variantCount * 3);
    
    return Math.min(100, score);
  }

  /**
   * Create variation of answers for A/B testing
   */
  private createVariationAnswers(baseAnswers: QuestionAnswers, variation: number): QuestionAnswers {
    const varied = { ...baseAnswers };
    
    switch (variation) {
      case 1: // Conversion-focused variation
        varied.primaryGoal = 'lead-generation';
        break;
      case 2: // Unique design variation
        varied.designPreference = 'unique';
        break;
      case 3: // Trust-focused variation
        if (!varied.differentiators) varied.differentiators = [];
        varied.differentiators.push('guaranteed');
        break;
    }
    
    return varied;
  }

  /**
   * Layout optimization methods
   */
  private simplifyLayout(layout: DynamicLayout): DynamicLayout {
    // Remove optional sections and simplify remaining ones
    const simplified = { ...layout };
    simplified.sections = simplified.sections.filter(section => 
      ['hero', 'services', 'contact'].includes(section.type)
    );
    return simplified;
  }

  private enhanceCallsToAction(layout: DynamicLayout): DynamicLayout {
    const enhanced = { ...layout };
    enhanced.sections.forEach(section => {
      if (section.type === 'hero' || section.type === 'cta') {
        section.styling.emphasis = 'dramatic';
        section.props.ctaSize = 'xl';
        section.props.urgencyText = true;
      }
    });
    return enhanced;
  }

  private addEngagementElements(layout: DynamicLayout): DynamicLayout {
    const enhanced = { ...layout };
    // Add interactive elements and animations
    enhanced.sections.forEach(section => {
      section.styling.animations = 'dynamic';
      if (section.type === 'gallery') {
        section.props.interactive = true;
      }
    });
    return enhanced;
  }

  /**
   * Rendering methods
   */
  private generateCSS(designSystem: DesignSystem): string {
    // Generate CSS custom properties and classes
    return `
      :root {
        --color-primary: ${designSystem.colors.primary};
        --color-secondary: ${designSystem.colors.secondary};
        --color-accent: ${designSystem.colors.accent};
        --font-heading: ${designSystem.typography.headingFont.family};
        --font-body: ${designSystem.typography.bodyFont.family};
        --spacing-unit: ${designSystem.spacing.unit}px;
        --border-radius: ${designSystem.visual.borderRadius.md};
      }
      
      /* Additional CSS classes would be generated here */
    `;
  }

  private generateStructure(layout: DynamicLayout): any {
    return {
      sections: layout.sections.map(section => ({
        id: section.id,
        type: section.type,
        variant: section.variant,
        props: section.props,
        styling: section.styling,
      })),
    };
  }

  private generateComponents(variants: Record<string, SectionVariant>): Record<string, any> {
    const components: Record<string, any> = {};
    
    Object.entries(variants).forEach(([sectionId, variant]) => {
      components[sectionId] = {
        variant: variant.id,
        layout: variant.layout,
        styling: variant.styling,
        requirements: variant.requirements,
      };
    });
    
    return components;
  }

  /**
   * Helper methods
   */
  private generateTemplateId(personality: string, industry: IndustryType): string {
    return `adaptive-${personality}-${industry}-${Date.now()}`;
  }

  private generateTemplateName(
    personality: string, 
    industry: IndustryType, 
    businessData: BusinessIntelligenceData
  ): string {
    const businessName = businessData.gbp?.businessName || 'Business';
    return `${businessName} - ${personality.charAt(0).toUpperCase() + personality.slice(1)} ${industry.charAt(0).toUpperCase() + industry.slice(1)}`;
  }
}