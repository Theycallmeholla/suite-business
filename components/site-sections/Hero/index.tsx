// Hero section variants
export { HeroModern } from './HeroModern';

// Export a map of all variants for dynamic selection
export const HeroVariants = {
  modern: 'HeroModern',
  // Future variants will be added here:
  // classic: 'HeroClassic',
  // bold: 'HeroBold',
  // minimal: 'HeroMinimal',
} as const;

export type HeroVariantType = keyof typeof HeroVariants;