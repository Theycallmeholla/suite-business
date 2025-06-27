// Export all variants for each section type
export * from './Hero';
export * from './Services';
export * from './Testimonials';

// For backward compatibility, export default variants
export { HeroModern as Hero } from './Hero/HeroModern';
export { ServicesCards as Services } from './Services/ServicesCards';
export { TestimonialsGrid as Testimonials } from './Testimonials';

// Maintain other section exports
export { About } from './About';
export { Features } from './Features';
export { CTA } from './CTA';
export { Contact } from './Contact';
export { ContactSection } from './ContactSection';
export { Gallery } from './Gallery';
export { FAQ } from './FAQ';
export { ServiceAreas } from './ServiceAreas';
