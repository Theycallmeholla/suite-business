/**
 * Design System Generator
 * 
 * Creates unique design systems based on:
 * - Industry patterns and color psychology
 * - Brand personality from question answers
 * - Business stage and target audience
 * - Content density and layout requirements
 * 
 * Each generated design system includes:
 * - Color palette with semantic meanings
 * - Typography pairings optimized for readability
 * - Spacing scales for consistent layouts
 * - Visual style elements (borders, shadows, animations)
 */

import { IndustryType } from '@/types/site-builder';
import { QuestionAnswers } from './dynamic-layout-generator';

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface TypographySystem {
  headingFont: {
    family: string;
    weights: number[];
    fallback: string;
  };
  bodyFont: {
    family: string;
    weights: number[];
    fallback: string;
  };
  scale: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface SpacingSystem {
  unit: number; // Base spacing unit in pixels
  scale: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  sections: {
    tight: string;
    normal: string;
    spacious: string;
  };
}

export interface VisualStyle {
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  borders: {
    width: {
      thin: string;
      normal: string;
      thick: string;
    };
    style: 'solid' | 'dashed' | 'dotted';
  };
}

export interface DesignSystem {
  id: string;
  name: string;
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  visual: VisualStyle;
  metadata: {
    personality: string;
    industry: IndustryType;
    generatedAt: Date;
    basedOn: string[];
  };
}

/**
 * Main design system generator class
 */
export class DesignSystemGenerator {
  private industryColorPalettes: Record<IndustryType, any>;
  private personalityModifiers: Record<string, any>;
  private typographyPairings: Record<string, any>;

  constructor() {
    this.industryColorPalettes = this.loadIndustryColorPalettes();
    this.personalityModifiers = this.loadPersonalityModifiers();
    this.typographyPairings = this.loadTypographyPairings();
  }

  /**
   * Generate a complete design system
   */
  generateDesignSystem(
    personality: string,
    industry: IndustryType,
    answers: QuestionAnswers,
    contentDensity: 'minimal' | 'moderate' | 'rich'
  ): DesignSystem {
    // Generate color palette
    const colors = this.generateColorPalette(personality, industry, answers);
    
    // Select typography system
    const typography = this.generateTypographySystem(personality, industry, contentDensity);
    
    // Create spacing system
    const spacing = this.generateSpacingSystem(personality, contentDensity);
    
    // Define visual style
    const visual = this.generateVisualStyle(personality, industry);

    return {
      id: this.generateDesignSystemId(personality, industry),
      name: this.generateDesignSystemName(personality, industry),
      colors,
      typography,
      spacing,
      visual,
      metadata: {
        personality,
        industry,
        generatedAt: new Date(),
        basedOn: this.getInfluencingFactors(answers),
      },
    };
  }

  /**
   * Generate color palette based on industry and personality
   */
  private generateColorPalette(
    personality: string,
    industry: IndustryType,
    answers: QuestionAnswers
  ): ColorPalette {
    // Start with industry base colors
    const industryColors = this.industryColorPalettes[industry];
    
    // Apply personality modifications
    const personalityMods = this.personalityModifiers[personality];
    
    // Generate primary color
    let primary = industryColors.primary;
    if (personalityMods?.colorShift) {
      primary = this.shiftColor(primary, personalityMods.colorShift);
    }
    
    // Handle specific answer influences
    if (answers.colorPreference) {
      primary = this.adaptColorForPreference(primary, answers.colorPreference);
    }
    
    if (answers.differentiators?.includes('eco-friendly')) {
      primary = this.shiftTowardsGreen(primary);
    }
    
    if (answers.differentiators?.includes('premium') || answers.differentiators?.includes('luxury')) {
      primary = this.enhanceForPremium(primary);
    }

    // Generate complementary colors
    const secondary = this.generateSecondaryColor(primary, personality);
    const accent = this.generateAccentColor(primary, secondary, industry);
    
    // Generate neutral palette
    const neutral = this.generateNeutralPalette(personality);
    
    // Generate semantic colors
    const semantic = this.generateSemanticColors(primary);

    return {
      primary,
      primaryLight: this.lightenColor(primary, 20),
      primaryDark: this.darkenColor(primary, 20),
      secondary,
      secondaryLight: this.lightenColor(secondary, 20),
      secondaryDark: this.darkenColor(secondary, 20),
      accent,
      neutral,
      semantic,
    };
  }

  /**
   * Generate typography system
   */
  private generateTypographySystem(
    personality: string,
    industry: IndustryType,
    contentDensity: 'minimal' | 'moderate' | 'rich'
  ): TypographySystem {
    // Select font pairing based on personality and industry
    const pairing = this.selectFontPairing(personality, industry);
    
    // Adjust scale based on content density
    const scale = this.generateTypeScale(contentDensity);
    
    // Set line heights and spacing
    const lineHeight = this.generateLineHeights(personality);
    const letterSpacing = this.generateLetterSpacing(personality);

    return {
      headingFont: pairing.heading,
      bodyFont: pairing.body,
      scale,
      lineHeight,
      letterSpacing,
    };
  }

  /**
   * Generate spacing system
   */
  private generateSpacingSystem(
    personality: string,
    contentDensity: 'minimal' | 'moderate' | 'rich'
  ): SpacingSystem {
    // Base unit varies by personality and content density
    let baseUnit = 16; // Default 1rem
    
    if (personality === 'premium' || personality === 'elegant') {
      baseUnit = 20; // More generous spacing
    } else if (personality === 'urgent' || contentDensity === 'rich') {
      baseUnit = 12; // Tighter spacing
    }
    
    // Generate scale
    const scale = {
      xs: `${baseUnit * 0.25}px`,
      sm: `${baseUnit * 0.5}px`,
      md: `${baseUnit}px`,
      lg: `${baseUnit * 1.5}px`,
      xl: `${baseUnit * 2}px`,
      '2xl': `${baseUnit * 3}px`,
      '3xl': `${baseUnit * 4}px`,
      '4xl': `${baseUnit * 6}px`,
      '5xl': `${baseUnit * 8}px`,
      '6xl': `${baseUnit * 12}px`,
    };
    
    // Section spacing
    const sections = {
      tight: `${baseUnit * 3}px`,
      normal: `${baseUnit * 5}px`,
      spacious: `${baseUnit * 8}px`,
    };

    return {
      unit: baseUnit,
      scale,
      sections,
    };
  }

  /**
   * Generate visual style elements
   */
  private generateVisualStyle(personality: string, industry: IndustryType): VisualStyle {
    // Border radius based on personality
    const borderRadius = this.generateBorderRadius(personality);
    
    // Shadows based on personality and industry
    const shadows = this.generateShadows(personality);
    
    // Animation preferences
    const animations = this.generateAnimations(personality);
    
    // Border styles
    const borders = this.generateBorders(personality);

    return {
      borderRadius,
      shadows,
      animations,
      borders,
    };
  }

  /**
   * Industry-specific color palettes
   */
  private loadIndustryColorPalettes() {
    return {
      landscaping: {
        primary: '#22C55E', // Green
        secondary: '#84CC16', // Lime
        accent: '#F59E0B', // Amber
        psychology: 'growth, nature, trust',
      },
      plumbing: {
        primary: '#3B82F6', // Blue
        secondary: '#0EA5E9', // Sky
        accent: '#F97316', // Orange
        psychology: 'trust, reliability, water',
      },
      hvac: {
        primary: '#06B6D4', // Cyan
        secondary: '#3B82F6', // Blue
        accent: '#EF4444', // Red
        psychology: 'cooling, heating, comfort',
      },
      cleaning: {
        primary: '#14B8A6', // Teal
        secondary: '#10B981', // Emerald
        accent: '#8B5CF6', // Violet
        psychology: 'cleanliness, freshness, care',
      },
      roofing: {
        primary: '#DC2626', // Red
        secondary: '#7C3AED', // Violet
        accent: '#F59E0B', // Amber
        psychology: 'strength, protection, durability',
      },
      electrical: {
        primary: '#F59E0B', // Amber
        secondary: '#EF4444', // Red
        accent: '#3B82F6', // Blue
        psychology: 'energy, power, safety',
      },
      general: {
        primary: '#3B82F6', // Blue
        secondary: '#10B981', // Green
        accent: '#F59E0B', // Amber
        psychology: 'trust, growth, energy',
      },
    };
  }

  /**
   * Personality-based color modifications
   */
  private loadPersonalityModifiers() {
    return {
      modern: {
        colorShift: { saturation: 10, lightness: 5 },
        contrast: 'high',
        vibrancy: 'medium',
      },
      traditional: {
        colorShift: { saturation: -15, lightness: -10 },
        contrast: 'medium',
        vibrancy: 'low',
      },
      premium: {
        colorShift: { saturation: -5, lightness: -15 },
        contrast: 'high',
        vibrancy: 'low',
        metallic: true,
      },
      urgent: {
        colorShift: { saturation: 20, lightness: 0 },
        contrast: 'very-high',
        vibrancy: 'high',
      },
      professional: {
        colorShift: { saturation: 0, lightness: 0 },
        contrast: 'medium',
        vibrancy: 'medium',
      },
      elegant: {
        colorShift: { saturation: -10, lightness: -5 },
        contrast: 'medium',
        vibrancy: 'low',
        sophistication: true,
      },
    };
  }

  /**
   * Typography pairings for different personalities
   */
  private loadTypographyPairings() {
    return {
      modern: {
        heading: {
          family: 'Inter',
          weights: [400, 600, 700],
          fallback: 'system-ui, sans-serif',
        },
        body: {
          family: 'Inter',
          weights: [400, 500],
          fallback: 'system-ui, sans-serif',
        },
      },
      traditional: {
        heading: {
          family: 'Georgia',
          weights: [400, 700],
          fallback: 'serif',
        },
        body: {
          family: 'system-ui',
          weights: [400, 500],
          fallback: 'sans-serif',
        },
      },
      premium: {
        heading: {
          family: 'Playfair Display',
          weights: [400, 600, 700],
          fallback: 'serif',
        },
        body: {
          family: 'Source Sans Pro',
          weights: [400, 500],
          fallback: 'sans-serif',
        },
      },
      urgent: {
        heading: {
          family: 'Roboto',
          weights: [500, 700, 900],
          fallback: 'sans-serif',
        },
        body: {
          family: 'Roboto',
          weights: [400, 500],
          fallback: 'sans-serif',
        },
      },
      professional: {
        heading: {
          family: 'Roboto',
          weights: [400, 500, 700],
          fallback: 'sans-serif',
        },
        body: {
          family: 'Open Sans',
          weights: [400, 500],
          fallback: 'sans-serif',
        },
      },
      elegant: {
        heading: {
          family: 'Cormorant Garamond',
          weights: [400, 600],
          fallback: 'serif',
        },
        body: {
          family: 'Lato',
          weights: [400, 500],
          fallback: 'sans-serif',
        },
      },
    };
  }

  // Helper methods for color manipulation and generation
  private shiftColor(color: string, shift: { saturation: number; lightness: number }): string {
    // Implementation would use a color manipulation library
    return color; // Simplified for now
  }

  private adaptColorForPreference(color: string, preference: string): string {
    // Adapt color based on user preference
    return color; // Simplified for now
  }

  private shiftTowardsGreen(color: string): string {
    // Shift color towards green for eco-friendly businesses
    return color; // Simplified for now
  }

  private enhanceForPremium(color: string): string {
    // Make color more sophisticated for premium businesses
    return color; // Simplified for now
  }

  private generateSecondaryColor(primary: string, personality: string): string {
    // Generate complementary secondary color
    return primary; // Simplified for now
  }

  private generateAccentColor(primary: string, secondary: string, industry: IndustryType): string {
    // Generate accent color that works with primary and secondary
    return primary; // Simplified for now
  }

  private generateNeutralPalette(personality: string) {
    // Generate neutral color palette
    return {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    };
  }

  private generateSemanticColors(primary: string) {
    return {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    };
  }

  private lightenColor(color: string, amount: number): string {
    // Lighten color by percentage
    return color; // Simplified for now
  }

  private darkenColor(color: string, amount: number): string {
    // Darken color by percentage
    return color; // Simplified for now
  }

  private selectFontPairing(personality: string, industry: IndustryType) {
    return this.typographyPairings[personality] || this.typographyPairings.professional;
  }

  private generateTypeScale(contentDensity: string) {
    const baseSize = contentDensity === 'rich' ? 14 : 16;
    const ratio = contentDensity === 'minimal' ? 1.25 : 1.2;
    
    return {
      xs: `${baseSize * 0.75}px`,
      sm: `${baseSize * 0.875}px`,
      base: `${baseSize}px`,
      lg: `${baseSize * ratio}px`,
      xl: `${baseSize * Math.pow(ratio, 2)}px`,
      '2xl': `${baseSize * Math.pow(ratio, 3)}px`,
      '3xl': `${baseSize * Math.pow(ratio, 4)}px`,
      '4xl': `${baseSize * Math.pow(ratio, 5)}px`,
      '5xl': `${baseSize * Math.pow(ratio, 6)}px`,
      '6xl': `${baseSize * Math.pow(ratio, 7)}px`,
    };
  }

  private generateLineHeights(personality: string) {
    const base = personality === 'premium' ? 1.7 : 1.6;
    
    return {
      tight: base - 0.25,
      normal: base,
      relaxed: base + 0.2,
      loose: base + 0.4,
    };
  }

  private generateLetterSpacing(personality: string) {
    return {
      tight: '-0.025em',
      normal: '0em',
      wide: personality === 'premium' ? '0.05em' : '0.025em',
    };
  }

  private generateBorderRadius(personality: string) {
    const radiusMap = {
      modern: { base: '8px', large: '16px' },
      traditional: { base: '4px', large: '8px' },
      premium: { base: '12px', large: '24px' },
      urgent: { base: '6px', large: '12px' },
      professional: { base: '6px', large: '12px' },
      elegant: { base: '16px', large: '32px' },
    };
    
    const radius = radiusMap[personality as keyof typeof radiusMap] || radiusMap.professional;
    
    return {
      none: '0px',
      sm: '4px',
      md: radius.base,
      lg: radius.large,
      xl: `${parseInt(radius.large) * 1.5}px`,
      full: '9999px',
    };
  }

  private generateShadows(personality: string) {
    const shadowIntensity = {
      modern: 'medium',
      traditional: 'low',
      premium: 'high',
      urgent: 'high',
      professional: 'medium',
      elegant: 'medium',
    };
    
    const intensity = shadowIntensity[personality as keyof typeof shadowIntensity] || 'medium';
    
    const shadows = {
      low: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      medium: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      high: {
        sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        md: '0 8px 12px -2px rgba(0, 0, 0, 0.15)',
        lg: '0 16px 24px -4px rgba(0, 0, 0, 0.15)',
        xl: '0 32px 48px -8px rgba(0, 0, 0, 0.15)',
      },
    };
    
    return {
      none: 'none',
      ...shadows[intensity as keyof typeof shadows],
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    };
  }

  private generateAnimations(personality: string) {
    const animationSpeed = {
      modern: 'normal',
      traditional: 'slow',
      premium: 'slow',
      urgent: 'fast',
      professional: 'normal',
      elegant: 'slow',
    };
    
    const speed = animationSpeed[personality as keyof typeof animationSpeed] || 'normal';
    
    const durations = {
      fast: { fast: '150ms', normal: '200ms', slow: '300ms' },
      normal: { fast: '200ms', normal: '300ms', slow: '500ms' },
      slow: { fast: '300ms', normal: '500ms', slow: '700ms' },
    };
    
    return {
      duration: durations[speed as keyof typeof durations],
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    };
  }

  private generateBorders(personality: string) {
    return {
      width: {
        thin: '1px',
        normal: '2px',
        thick: personality === 'urgent' ? '4px' : '3px',
      },
      style: 'solid' as const,
    };
  }

  private generateDesignSystemId(personality: string, industry: IndustryType): string {
    return `ds-${personality}-${industry}-${Date.now()}`;
  }

  private generateDesignSystemName(personality: string, industry: IndustryType): string {
    return `${personality.charAt(0).toUpperCase() + personality.slice(1)} ${industry.charAt(0).toUpperCase() + industry.slice(1)} Design`;
  }

  private getInfluencingFactors(answers: QuestionAnswers): string[] {
    const factors = [];
    
    if (answers.differentiators) factors.push(...answers.differentiators);
    if (answers.emergencyService) factors.push('emergency-service');
    if (answers.businessStage) factors.push(`business-stage-${answers.businessStage}`);
    if (answers.colorPreference) factors.push(`color-${answers.colorPreference}`);
    
    return factors;
  }
}