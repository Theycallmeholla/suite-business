/**
 * Template Variant Selector
 * 
 * Intelligently selects the best template variants based on:
 * - Data quality/quantity evaluation
 * - Business personality and industry
 * - User preferences from questions
 * - Conversion optimization goals
 */

import { DataQualityScore, dataEvaluator } from './data-evaluator';
import { BusinessIntelligenceData } from '@/types/intelligence';
import { IndustryType } from '@/types/site-builder';
import { QuestionAnswers } from '@/lib/template-engine/dynamic-layout-generator';
import { findBestVariant, SectionVariant } from '@/lib/template-engine/section-variants';
import { logger } from '@/lib/logger';

export interface TemplateSelectionResult {
  selectedTemplate: string;
  sectionVariants: Record<string, string>;
  sectionOrder: string[];
  reasoning: Record<string, string>;
  dataQuality: DataQualityScore;
}

export class TemplateVariantSelector {
  /**
   * Main selection method - evaluates data and selects optimal variants
   */
  async selectOptimalTemplate(
    businessData: BusinessIntelligenceData,
    industry: IndustryType,
    userAnswers: QuestionAnswers
  ): Promise<TemplateSelectionResult> {
    // Step 1: Evaluate data quality
    const dataQuality = dataEvaluator.evaluateBusinessData(businessData);
    
    logger.info('Data quality evaluation', {
      overall: dataQuality.overall,
      breakdown: dataQuality.breakdown,
      details: dataQuality.details,
    });

    // Step 2: Determine business personality
    const personality = this.determinePersonality(userAnswers, industry, businessData);
    
    // Step 3: Select base template
    const selectedTemplate = this.selectBaseTemplate(industry, personality, dataQuality);
    
    // Step 4: Select section variants
    const sectionVariants = this.selectSectionVariants(
      dataQuality,
      personality,
      industry,
      userAnswers,
      businessData
    );
    
    // Step 5: Determine section order
    const sectionOrder = this.determineSectionOrder(
      sectionVariants,
      personality,
      industry,
      userAnswers
    );
    
    // Step 6: Generate reasoning for selections
    const reasoning = this.generateSelectionReasoning(
      dataQuality,
      personality,
      sectionVariants
    );

    return {
      selectedTemplate,
      sectionVariants,
      sectionOrder,
      reasoning,
      dataQuality,
    };
  }

  /**
   * Determine business personality based on answers and data
   */
  private determinePersonality(
    userAnswers: QuestionAnswers,
    industry: IndustryType,
    businessData: BusinessIntelligenceData
  ): string {
    // Direct answer takes precedence
    if (userAnswers.brandPersonality) {
      return userAnswers.brandPersonality;
    }

    // Emergency services check
    if (userAnswers.emergencyService || 
        ['plumbing', 'hvac', 'electrical'].includes(industry)) {
      const hasEmergencyIndicators = 
        businessData.basicInfo?.description?.toLowerCase().includes('emergency') ||
        businessData.basicInfo?.description?.toLowerCase().includes('24/7') ||
        businessData.services?.services?.some(s => 
          s.toLowerCase().includes('emergency')
        );
      
      if (hasEmergencyIndicators) return 'urgent';
    }

    // Premium indicators
    const premiumIndicators = [
      dataQuality.breakdown.media >= 80,
      dataQuality.breakdown.differentiation >= 70,
      businessData.differentiation?.awards?.length > 0,
      userAnswers.targetAudience === 'high-end',
    ].filter(Boolean).length;
    
    if (premiumIndicators >= 2) return 'premium';

    // Traditional indicators
    const yearsInBusiness = businessData.basicInfo?.years_in_business || 0;
    if (yearsInBusiness > 20 || userAnswers.businessStage === 'mature') {
      return 'traditional';
    }

    // Default personalities by industry
    const industryDefaults: Record<string, string> = {
      landscaping: 'professional',
      hvac: 'trustworthy',
      plumbing: 'reliable',
      electrical: 'technical',
      cleaning: 'fresh',
      roofing: 'sturdy',
    };

    return industryDefaults[industry] || 'professional';
  }

  /**
   * Select the base template based on industry and personality
   */
  private selectBaseTemplate(
    industry: IndustryType,
    personality: string,
    dataQuality: DataQualityScore
  ): string {
    // Premium templates for rich data + premium personality
    if (dataQuality.overall === 'rich' && personality === 'premium') {
      if (industry === 'landscaping') return 'emerald-elegance';
      if (industry === 'cleaning') return 'serene-minimal';
      return 'nature-premium';
    }

    // Industry-specific selections
    if (industry === 'landscaping') {
      if (dataQuality.details.photoCount >= 10) return 'dream-garden';
      return 'emerald-elegance';
    }

    if (['hvac', 'plumbing', 'electrical'].includes(industry)) {
      if (personality === 'urgent') return 'modern-tech';
      return 'classic-business';
    }

    // Data quality based selection
    if (dataQuality.overall === 'minimal') {
      return 'classic-business'; // Works well with limited data
    }

    return 'nature-premium'; // Good default for most cases
  }

  /**
   * Select the best variant for each section
   */
  private selectSectionVariants(
    dataQuality: DataQualityScore,
    personality: string,
    industry: IndustryType,
    userAnswers: QuestionAnswers,
    businessData: BusinessIntelligenceData
  ): Record<string, string> {
    const variants: Record<string, string> = {};
    
    // Hero section
    variants.hero = this.selectHeroVariant(dataQuality, personality, industry);
    
    // Services section (always include)
    variants.services = this.selectServicesVariant(
      dataQuality.details.serviceCount,
      personality
    );
    
    // About section
    if (this.shouldIncludeAbout(dataQuality, userAnswers)) {
      variants.about = this.selectAboutVariant(dataQuality, personality);
    }
    
    // Gallery section
    if (dataQuality.details.photoCount >= 4) {
      variants.gallery = this.selectGalleryVariant(
        dataQuality.details.photoCount,
        personality
      );
    }
    
    // Testimonials section
    if (dataQuality.details.reviewCount >= 3) {
      variants.testimonials = this.selectTestimonialsVariant(
        dataQuality.details.reviewCount,
        personality
      );
    }
    
    // Features/Trust section
    if (dataQuality.breakdown.differentiation >= 50) {
      variants.features = 'features-grid';
    }
    
    // FAQ section (always good for SEO)
    variants.faq = 'faq-accordion';
    
    // CTA section
    variants.cta = this.selectCTAVariant(personality, userAnswers);
    
    // Contact section (always include)
    variants.contact = this.selectContactVariant(personality, industry);

    return variants;
  }

  private selectHeroVariant(
    dataQuality: DataQualityScore,
    personality: string,
    industry: string
  ): string {
    // Emergency services
    if (personality === 'urgent') return 'hero-urgent';
    
    // Rich media available
    if (dataQuality.details.photoCount >= 5 && personality === 'premium') {
      return 'hero-elegant';
    }
    
    // Content-rich businesses
    if (dataQuality.overall === 'rich' && dataQuality.details.contentLength > 200) {
      return 'hero-detailed';
    }
    
    // Traditional businesses
    if (personality === 'traditional') return 'hero-classic';
    
    // Default modern
    return 'hero-modern';
  }

  private selectServicesVariant(serviceCount: number, personality: string): string {
    if (serviceCount >= 6) return 'services-grid';
    if (serviceCount <= 3) return 'services-featured';
    if (personality === 'premium') return 'services-elegant';
    return 'services-grid';
  }

  private selectAboutVariant(
    dataQuality: DataQualityScore,
    personality: string
  ): string {
    if (dataQuality.details.hasCertifications) return 'about-team';
    if (personality === 'traditional') return 'about-story';
    return 'about-values';
  }

  private selectGalleryVariant(photoCount: number, personality: string): string {
    if (photoCount >= 12) return 'gallery-masonry';
    if (personality === 'premium') return 'gallery-carousel';
    return 'gallery-grid';
  }

  private selectTestimonialsVariant(reviewCount: number, personality: string): string {
    if (reviewCount >= 20) return 'testimonials-grid';
    if (reviewCount >= 5) return 'testimonials-carousel';
    return 'testimonials-featured';
  }

  private selectCTAVariant(personality: string, userAnswers: QuestionAnswers): string {
    if (personality === 'urgent' || userAnswers.emergencyService) {
      return 'cta-urgent';
    }
    if (userAnswers.primaryGoal === 'generate-leads') {
      return 'cta-split';
    }
    return 'cta-centered';
  }

  private selectContactVariant(personality: string, industry: string): string {
    if (personality === 'urgent') return 'contact-emergency';
    if (industry === 'landscaping') return 'contact-map'; // Show service areas
    return 'contact-split';
  }

  private shouldIncludeAbout(
    dataQuality: DataQualityScore,
    userAnswers: QuestionAnswers
  ): boolean {
    return dataQuality.details.hasDescription || 
           dataQuality.details.hasCertifications ||
           userAnswers.businessStage === 'established' ||
           dataQuality.overall !== 'minimal';
  }

  /**
   * Determine optimal section order based on priorities
   */
  private determineSectionOrder(
    sectionVariants: Record<string, string>,
    personality: string,
    industry: IndustryType,
    userAnswers: QuestionAnswers
  ): string[] {
    const sections = Object.keys(sectionVariants);
    const order: string[] = ['hero']; // Always start with hero
    
    // Emergency services: quick contact
    if (personality === 'urgent') {
      order.push('services', 'contact', 'cta');
    } 
    // Premium: storytelling flow
    else if (personality === 'premium') {
      order.push('about', 'services', 'gallery');
    }
    // Default: conversion-optimized
    else {
      order.push('services', 'about');
    }
    
    // Add remaining sections in standard order
    const standardOrder = [
      'features', 'gallery', 'testimonials', 
      'faq', 'cta', 'contact'
    ];
    
    standardOrder.forEach(section => {
      if (sections.includes(section) && !order.includes(section)) {
        order.push(section);
      }
    });
    
    return order;
  }

  /**
   * Generate reasoning for variant selections
   */
  private generateSelectionReasoning(
    dataQuality: DataQualityScore,
    personality: string,
    sectionVariants: Record<string, string>
  ): Record<string, string> {
    const reasoning: Record<string, string> = {};
    
    Object.entries(sectionVariants).forEach(([section, variant]) => {
      reasoning[section] = this.getVariantReasoning(
        section,
        variant,
        dataQuality,
        personality
      );
    });
    
    return reasoning;
  }

  private getVariantReasoning(
    section: string,
    variant: string,
    dataQuality: DataQualityScore,
    personality: string
  ): string {
    // Example reasoning logic
    const reasoningMap: Record<string, string> = {
      'hero-elegant': `Selected elegant hero due to ${dataQuality.details.photoCount} high-quality photos and ${personality} brand personality`,
      'services-grid': `Grid layout chosen to showcase ${dataQuality.details.serviceCount} services effectively`,
      'gallery-masonry': `Masonry gallery selected to display ${dataQuality.details.photoCount} photos in visually appealing way`,
      // Add more reasoning...
    };
    
    return reasoningMap[variant] || `Selected ${variant} based on data quality and brand fit`;
  }
}

export const templateSelector = new TemplateVariantSelector();
