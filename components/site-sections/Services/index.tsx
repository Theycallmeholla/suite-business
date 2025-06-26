// Services section variants
export { ServicesCards } from './ServicesCards';

// Export a map of all variants for dynamic selection
export const ServicesVariants = {
  cards: 'ServicesCards',
  // Future variants will be added here:
  // grid: 'ServicesGrid',
  // carousel: 'ServicesCarousel',
  // list: 'ServicesList',
} as const;

export type ServicesVariantType = keyof typeof ServicesVariants;