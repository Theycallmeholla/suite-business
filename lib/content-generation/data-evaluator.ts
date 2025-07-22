/**
 * Data Quality Evaluator
 * 
 * Evaluates the quality and quantity of business data to inform
 * template variant selection and content population decisions
 */

import { BusinessIntelligenceData } from '@/types/intelligence';

export interface DataQualityScore {
  overall: 'minimal' | 'moderate' | 'rich';
  breakdown: {
    basicInfo: number;      // 0-100
    media: number;          // 0-100
    services: number;       // 0-100
    reviews: number;        // 0-100
    content: number;        // 0-100
    differentiation: number; // 0-100
  };
  details: {
    photoCount: number;
    reviewCount: number;
    serviceCount: number;
    hasDescription: boolean;
    hasLogo: boolean;
    hasCertifications: boolean;
    hasHours: boolean;
    hasServiceArea: boolean;
    contentLength: number;
  };
}

export class DataEvaluator {
  /**
   * Evaluate business data quality and quantity
   */
  evaluateBusinessData(data: BusinessIntelligenceData): DataQualityScore {
    const details = this.extractDataDetails(data);
    const breakdown = this.calculateBreakdown(data, details);
    const overall = this.calculateOverallScore(breakdown);

    return {
      overall,
      breakdown,
      details,
    };
  }

  private extractDataDetails(data: BusinessIntelligenceData) {
    return {
      // Media
      photoCount: data.visuals?.photos?.length || 0,
      hasLogo: !!data.visuals?.logo,
      
      // Reviews
      reviewCount: data.reputation?.total_reviews || 0,
      
      // Services
      serviceCount: data.services?.services?.length || 0,
      
      // Content
      hasDescription: !!data.basicInfo?.description,
      contentLength: (data.basicInfo?.description || '').length,
      
      // Business details
      hasCertifications: (data.differentiation?.certifications?.length || 0) > 0,
      hasHours: !!data.basicInfo?.hours,
      hasServiceArea: !!data.basicInfo?.service_area,
    };
  }

  private calculateBreakdown(data: BusinessIntelligenceData, details: any) {
    return {
      // Basic info score (name, address, phone, hours)
      basicInfo: this.scoreBasicInfo(data),
      
      // Media score (photos, logo)
      media: this.scoreMedia(details),
      
      // Services score (number and detail of services)
      services: this.scoreServices(data, details),
      
      // Reviews score (count and quality)
      reviews: this.scoreReviews(data, details),
      
      // Content score (descriptions, about text)
      content: this.scoreContent(data, details),
      
      // Differentiation score (certifications, USPs, awards)
      differentiation: this.scoreDifferentiation(data),
    };
  }

  private scoreBasicInfo(data: BusinessIntelligenceData): number {
    let score = 0;
    
    if (data.basicInfo?.name) score += 25;
    if (data.basicInfo?.address) score += 20;
    if (data.basicInfo?.primary_phone) score += 20;
    if (data.basicInfo?.hours) score += 20;
    if (data.basicInfo?.service_area) score += 15;
    
    return Math.min(score, 100);
  }

  private scoreMedia(details: any): number {
    let score = 0;
    
    // Photos scoring
    if (details.photoCount >= 20) score += 50;
    else if (details.photoCount >= 10) score += 40;
    else if (details.photoCount >= 5) score += 30;
    else if (details.photoCount >= 3) score += 20;
    else if (details.photoCount >= 1) score += 10;
    
    // Logo bonus
    if (details.hasLogo) score += 25;
    
    // Quality bonus (would need to check resolution/professional quality)
    score += 25; // Placeholder for quality assessment
    
    return Math.min(score, 100);
  }

  private scoreServices(data: BusinessIntelligenceData, details: any): number {
    let score = 0;
    
    // Service count scoring
    if (details.serviceCount >= 10) score += 40;
    else if (details.serviceCount >= 6) score += 35;
    else if (details.serviceCount >= 4) score += 25;
    else if (details.serviceCount >= 2) score += 15;
    else if (details.serviceCount >= 1) score += 10;
    
    // Service details bonus
    const hasServiceDetails = data.services?.service_details && 
      Object.keys(data.services.service_details).length > 0;
    if (hasServiceDetails) score += 30;
    
    // Pricing information bonus
    if (data.services?.pricing_type && data.services.pricing_type !== 'hidden') {
      score += 30;
    }
    
    return Math.min(score, 100);
  }

  private scoreReviews(data: BusinessIntelligenceData, details: any): number {
    let score = 0;
    
    // Review count scoring
    if (details.reviewCount >= 100) score += 50;
    else if (details.reviewCount >= 50) score += 40;
    else if (details.reviewCount >= 20) score += 30;
    else if (details.reviewCount >= 10) score += 20;
    else if (details.reviewCount >= 5) score += 10;
    
    // Rating quality bonus
    const avgRating = data.reputation?.average_rating || 0;
    if (avgRating >= 4.8) score += 30;
    else if (avgRating >= 4.5) score += 25;
    else if (avgRating >= 4.0) score += 20;
    else if (avgRating >= 3.5) score += 10;
    
    // Review content bonus
    const hasReviewContent = data.reputation?.google_reviews?.some(r => r.text?.length > 50);
    if (hasReviewContent) score += 20;
    
    return Math.min(score, 100);
  }

  private scoreContent(data: BusinessIntelligenceData, details: any): number {
    let score = 0;
    
    // Description length scoring
    if (details.contentLength >= 500) score += 50;
    else if (details.contentLength >= 300) score += 40;
    else if (details.contentLength >= 150) score += 30;
    else if (details.contentLength >= 50) score += 20;
    else if (details.contentLength > 0) score += 10;
    
    // Additional content bonus
    if (data.content?.tagline) score += 20;
    if (data.content?.mission_statement) score += 15;
    if (data.content?.about_section) score += 15;
    
    return Math.min(score, 100);
  }

  private scoreDifferentiation(data: BusinessIntelligenceData): number {
    let score = 0;
    
    // Certifications
    const certCount = data.differentiation?.certifications?.length || 0;
    if (certCount >= 3) score += 35;
    else if (certCount >= 2) score += 25;
    else if (certCount >= 1) score += 15;
    
    // Awards
    const awardCount = data.differentiation?.awards?.length || 0;
    if (awardCount >= 3) score += 25;
    else if (awardCount >= 1) score += 15;
    
    // Unique selling points
    const uspCount = data.differentiation?.unique_selling_points?.length || 0;
    if (uspCount >= 3) score += 25;
    else if (uspCount >= 2) score += 20;
    else if (uspCount >= 1) score += 10;
    
    // Guarantees
    if (data.differentiation?.guarantees?.length) score += 15;
    
    return Math.min(score, 100);
  }

  private calculateOverallScore(breakdown: any): 'minimal' | 'moderate' | 'rich' {
    // Weight different aspects based on importance
    const weights = {
      basicInfo: 0.15,
      media: 0.25,
      services: 0.20,
      reviews: 0.20,
      content: 0.10,
      differentiation: 0.10,
    };
    
    const weightedScore = Object.entries(breakdown).reduce((total, [key, score]) => {
      return total + ((score as number) * (weights[key as keyof typeof weights] || 0));
    }, 0);
    
    if (weightedScore >= 70) return 'rich';
    if (weightedScore >= 40) return 'moderate';
    return 'minimal';
  }

  /**
   * Get recommendations for which template variants to use
   */
  getVariantRecommendations(
    dataScore: DataQualityScore,
    industry: string,
    businessPersonality?: string
  ) {
    const recommendations: Record<string, string> = {};
    
    // Hero section recommendation
    if (dataScore.details.photoCount >= 5 && dataScore.overall === 'rich') {
      recommendations.hero = 'hero-elegant'; // Use image-rich variant
    } else if (businessPersonality === 'urgent' || industry === 'plumbing') {
      recommendations.hero = 'hero-urgent'; // Emergency services variant
    } else if (dataScore.overall === 'minimal') {
      recommendations.hero = 'hero-classic'; // Simple centered variant
    } else {
      recommendations.hero = 'hero-modern'; // Default modern variant
    }
    
    // Services section recommendation
    if (dataScore.details.serviceCount >= 6) {
      recommendations.services = 'services-grid'; // Grid for many services
    } else if (dataScore.details.serviceCount <= 3) {
      recommendations.services = 'services-featured'; // Featured for few services
    } else {
      recommendations.services = 'services-elegant'; // Balanced approach
    }
    
    // Gallery recommendation
    if (dataScore.details.photoCount >= 8) {
      recommendations.gallery = 'gallery-masonry'; // Pinterest style for many photos
    } else if (dataScore.details.photoCount >= 4) {
      recommendations.gallery = 'gallery-carousel'; // Carousel for moderate photos
    } else {
      recommendations.gallery = null; // Skip gallery if too few photos
    }
    
    // Testimonials recommendation
    if (dataScore.details.reviewCount >= 20) {
      recommendations.testimonials = 'testimonials-grid'; // Show many reviews
    } else if (dataScore.details.reviewCount >= 5) {
      recommendations.testimonials = 'testimonials-carousel'; // Rotate through reviews
    } else if (dataScore.details.reviewCount >= 1) {
      recommendations.testimonials = 'testimonials-featured'; // Feature single review
    } else {
      recommendations.testimonials = null; // Skip if no reviews
    }
    
    return recommendations;
  }
}

export const dataEvaluator = new DataEvaluator();
