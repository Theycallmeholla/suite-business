/**
 * Example: Complete Template Selection Flow
 * 
 * This demonstrates how the new system works end-to-end
 * for a landscaping business.
 */

import { AITemplateSelectionEngine } from '@/lib/content-generation/ai-template-selection-engine';
import { BusinessIntelligenceData } from '@/types/intelligence';
import { QuestionAnswers } from '@/lib/template-engine/dynamic-layout-generator';

// Example business data from Google Business Profile
const exampleBusinessData: BusinessIntelligenceData = {
  basicInfo: {
    name: "Green Thumb Landscaping",
    address: "123 Main St, Houston, TX 77001",
    city: "Houston",
    state: "TX",
    primary_phone: "(713) 555-0123",
    email: "info@greenthumbhouston.com",
    website: "https://greenthumbhouston.com",
    years_in_business: 15,
    service_area: "Houston and surrounding areas",
    description: "Family-owned landscaping company serving Houston for over 15 years",
    hours: {
      monday: { open: "8:00", close: "17:00" },
      tuesday: { open: "8:00", close: "17:00" },
      // ... etc
    },
  },
  
  services: {
    services: [
      "Lawn Care",
      "Landscape Design",
      "Irrigation Systems",
      "Tree Trimming",
      "Hardscaping",
      "Seasonal Cleanup"
    ],
    primary_service: "Lawn Care",
    service_details: {
      "Lawn Care": {
        description: "Weekly mowing, edging, and maintenance",
        features: ["Mowing", "Edging", "Fertilization"],
        pricing: "Starting at $35/visit"
      }
    },
    pricing_type: "transparent",
    emergency_service: false,
  },
  
  visuals: {
    photos: [
      { url: "photo1.jpg", width: 1920, height: 1080, caption: "Beautiful lawn" },
      { url: "photo2.jpg", width: 1920, height: 1080, caption: "Patio installation" },
      { url: "photo3.jpg", width: 1920, height: 1080, caption: "Garden design" },
      // ... 12 total photos
    ],
    logo: { url: "logo.png", width: 500, height: 500 },
    hero_image: "hero.jpg",
  },
  
  reputation: {
    average_rating: 4.8,
    total_reviews: 127,
    google_reviews: [
      {
        rating: 5,
        text: "Excellent service! They transformed our backyard...",
        author: "John D.",
        date: "2024-12-01"
      },
      // ... more reviews
    ],
  },
  
  differentiation: {
    certifications: ["Licensed & Insured", "BBB A+ Rating"],
    awards: ["Best of Houston 2023"],
    unique_selling_points: ["Same-day quotes", "Eco-friendly practices"],
    guarantees: ["100% Satisfaction Guarantee"],
  },
  
  content: {
    tagline: "Transform Your Outdoor Space",
    mission_statement: "Creating beautiful, sustainable landscapes",
    about_section: null, // Will use fallback
  },
};

// Example user answers from questionnaire
const exampleUserAnswers: QuestionAnswers = {
  services: ["Lawn Care", "Landscaping", "Hardscaping"],
  differentiators: ["Family owned", "15 years experience", "Eco-friendly"],
  emergencyService: false,
  businessStage: "established",
  serviceRadius: "25-miles",
  brandPersonality: "professional", // Could be: professional, premium, urgent, traditional
  targetAudience: "homeowners",
  primaryGoal: "generate-leads",
  designPreference: "modern-clean",
  colorPreference: "nature-green",
};

// Run the template selection
async function demonstrateTemplateSelection() {
  const engine = new AITemplateSelectionEngine();
  
  console.log("=== TEMPLATE SELECTION DEMO ===\n");
  
  // Generate website
  const result = await engine.generateWebsiteCopy(
    exampleBusinessData,
    'landscaping',
    exampleUserAnswers
  );
  
  console.log("1. DATA QUALITY EVALUATION:");
  console.log("   Overall Score:", result.metadata.dataQuality.overall);
  console.log("   Breakdown:");
  console.log("   - Basic Info:", result.metadata.dataQuality.breakdown.basicInfo);
  console.log("   - Media:", result.metadata.dataQuality.breakdown.media);
  console.log("   - Services:", result.metadata.dataQuality.breakdown.services);
  console.log("   - Reviews:", result.metadata.dataQuality.breakdown.reviews);
  console.log("   - Content:", result.metadata.dataQuality.breakdown.content);
  
  console.log("\n2. SELECTED TEMPLATE:", result.selectedTemplate);
  console.log("   (Based on: established business + rich media + professional personality)");
  
  console.log("\n3. SECTION VARIANTS SELECTED:");
  Object.entries(result.populatedSections).forEach(([section, data]) => {
    console.log(`   - ${section}: ${data.variant}`);
    console.log(`     Reasoning: ${result.metadata.reasoning[section]}`);
  });
  
  console.log("\n4. SECTION ORDER:", result.sectionOrder.join(" → "));
  
  console.log("\n5. POPULATED CONTENT EXAMPLES:");
  
  // Hero Section
  const hero = result.populatedSections.hero;
  console.log("\n   HERO SECTION:");
  console.log("   - Headline:", hero.content.headline);
  console.log("   - Subheadline:", hero.content.subheadline);
  console.log("   - Primary CTA:", hero.content.primaryCTA.text);
  console.log("   - Trust Badges:", hero.content.trustBadges.join(", "));
  console.log("   - Data Source:", hero.metadata.dataSource);
  
  // Services Section
  const services = result.populatedSections.services;
  console.log("\n   SERVICES SECTION:");
  console.log("   - Layout:", services.content.layout);
  console.log("   - Service Count:", services.content.services.length);
  services.content.services.slice(0, 3).forEach(service => {
    console.log(`   - ${service.name}: ${service.description.substring(0, 50)}...`);
  });
  
  console.log("\n6. SEO KEYWORDS:", result.metadata.seoKeywords.join(", "));
  
  console.log("\n7. GENERATION METHOD:", result.metadata.generationMethod);
}

// Expected Output:
/*
=== TEMPLATE SELECTION DEMO ===

1. DATA QUALITY EVALUATION:
   Overall Score: rich
   Breakdown:
   - Basic Info: 85
   - Media: 75
   - Services: 65
   - Reviews: 95
   - Content: 40

2. SELECTED TEMPLATE: emerald-elegance
   (Based on: established business + rich media + professional personality)

3. SECTION VARIANTS SELECTED:
   - hero: hero-elegant
     Reasoning: Selected elegant hero due to 12 high-quality photos and professional brand personality
   - services: services-grid
     Reasoning: Grid layout chosen to showcase 6 services effectively
   - about: about-story
     Reasoning: Story variant selected for established business with 15 years history
   - gallery: gallery-masonry
     Reasoning: Masonry gallery selected to display 12 photos in visually appealing way
   - testimonials: testimonials-carousel
     Reasoning: Carousel chosen for 127 reviews to rotate through highlights
   - cta: cta-centered
     Reasoning: Centered CTA for lead generation focus
   - contact: contact-map
     Reasoning: Map variant to show service areas for landscaping business

4. SECTION ORDER: hero → services → about → gallery → testimonials → cta → contact

5. POPULATED CONTENT EXAMPLES:

   HERO SECTION:
   - Headline: Transform Your Outdoor Space
   - Subheadline: Professional landscaping with 15 years of experience, serving Houston and surrounding areas. Transform your outdoor space with our expert team.
   - Primary CTA: Get Free Estimate
   - Trust Badges: Licensed & Insured, BBB A+ Rating, 15 Years Experience
   - Data Source: business

   SERVICES SECTION:
   - Layout: grid
   - Service Count: 6
   - Lawn Care: Weekly mowing, edging, and maintenance...
   - Landscape Design: Transform your outdoor space with professional...
   - Irrigation Systems: Protect your landscape investment with efficient...

6. SEO KEYWORDS: landscaping, Houston, lawn care, landscape design, irrigation, hardscaping, tree trimming

7. GENERATION METHOD: ai-selected (or 'fallback' if no OpenAI key)
*/

// Run the demo
demonstrateTemplateSelection();
