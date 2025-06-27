/**
 * Complete Example: Multi-Source Template Selection
 * 
 * This demonstrates how the system uses ALL data sources:
 * - Google Business Profile API
 * - Places API
 * - DataForSEO SERP
 * - User form answers
 */

import { multiSourceEvaluator } from '@/lib/content-generation/multi-source-data-evaluator';
import { questionGenerator } from '@/lib/content-generation/intelligent-question-generator';
import { enhancedTemplateSelector } from '@/lib/content-generation/enhanced-template-selector';
import { enhancedLandscapingPopulator } from '@/lib/content-generation/industry-populators/enhanced-landscaping-populator';

// Example data from all sources
const exampleMultiSourceData = {
  // Google Business Profile data
  gbp: {
    name: "GreenScape Professionals",
    title: "GreenScape Professionals",
    placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    
    profile: {
      description: "Award-winning landscaping company serving Houston for over 20 years. We specialize in sustainable landscape design and premium lawn care services.",
    },
    
    primaryCategory: {
      displayName: "Landscaping Service",
      serviceTypes: [
        { displayName: "Lawn Care" },
        { displayName: "Landscape Design" },
        { displayName: "Irrigation Installation" },
      ],
    },
    
    additionalCategories: [
      {
        displayName: "Tree Service",
        serviceTypes: [{ displayName: "Tree Trimming" }],
      },
    ],
    
    photos: [
      { url: "photo1.jpg", category: "EXTERIOR" },
      { url: "photo2.jpg", category: "AT_WORK" },
      { url: "photo3.jpg", category: "EXTERIOR" },
      // ... 15 total photos
    ],
    
    rating: 4.9,
    userRatingCount: 234,
    
    regularHours: {
      periods: [
        { openDay: "MONDAY", openTime: "08:00", closeTime: "17:00" },
        // ... rest of week
      ],
    },
    
    attributes: {
      has_wheelchair_accessible_entrance: true,
      serves_organic_products: true,
      accepts_credit_cards: true,
    },
    
    serviceArea: {
      places: {
        placeInfos: [
          { placeName: "Houston, TX" },
          { placeName: "Spring, TX" },
          { placeName: "The Woodlands, TX" },
        ],
      },
    },
    
    website: "https://greenscapehouston.com",
    primaryPhone: "(713) 555-LAWN",
  },

  // Places API data
  places: {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    name: "GreenScape Professionals",
    
    photos: [
      { 
        photo_reference: "photo_ref_1",
        width: 4032,
        height: 3024,
      },
      // ... more photos
    ],
    
    reviews: [
      {
        rating: 5,
        text: "They transformed our backyard! The new patio and garden design exceeded our expectations. Very professional team.",
        time: 1703001600,
        author_name: "Sarah Johnson",
      },
      {
        rating: 5,
        text: "Best lawn care service in Houston. They use organic products and my grass has never looked better. Highly recommend their monthly maintenance plan.",
        time: 1702396800,
        author_name: "Mike Chen",
      },
      {
        rating: 4,
        text: "Great irrigation system installation. They also fixed our drainage issues. Only complaint is they were booked solid for 2 weeks.",
        time: 1701792000,
        author_name: "Lisa Martinez",
      },
      // ... more reviews
    ],
    
    opening_hours: {
      weekday_text: [
        "Monday: 8:00 AM – 5:00 PM",
        // ... rest
      ],
    },
    
    price_level: 3, // Moderate pricing
    types: ["landscaper", "lawn_care_service", "garden_center"],
  },

  // DataForSEO SERP data
  serp: {
    location: "Houston, TX",
    searchQuery: "landscaping services houston",
    
    competitors: [
      {
        name: "Houston Lawn Pros",
        snippet: "Affordable lawn care starting at $30. No contracts required.",
        position: 1,
        isAd: true,
      },
      {
        name: "Elite Landscapes Houston",
        snippet: "Luxury landscape design and installation. Award-winning designs.",
        position: 2,
        rating: 4.7,
        reviewCount: 189,
      },
      {
        name: "ABC Landscaping",
        snippet: "Full service landscaping. Free estimates. Family owned since 1995.",
        position: 3,
        rating: 4.5,
        reviewCount: 156,
      },
    ],
    
    peopleAlsoAsk: [
      "How much does landscaping cost in Houston?",
      "What is the best time to plant in Houston?",
      "Do I need a permit for landscaping in Houston?",
      "What grass types work best in Houston climate?",
    ],
    
    competitorServices: [
      "Lawn Care",
      "Landscape Design",
      "Tree Service",
      "Irrigation",
      "Sod Installation",
    ],
    
    competitorPricingTransparency: "hidden", // Most hide pricing
    avgCompetitorReviews: 160,
    
    keywordGaps: [
      "xeriscape houston",
      "native plant landscaping",
      "mosquito control",
      "landscape lighting",
    ],
    
    serviceKeywordVolume: {
      "lawn care": 2400,
      "landscape design": 1900,
      "irrigation": 890,
      "tree trimming": 1200,
      "hardscaping": 450,
    },
    
    localInsights: {
      seasonalTrends: true, // High spring/fall demand
      emergencyDemand: true, // Storm cleanup services
      growthAreas: ["The Woodlands", "Cypress"],
    },
  },

  // User answers from intelligent questions
  userAnswers: {
    // Confirmed claims from description
    confirmedClaims: [
      "Award-winning",
      "20 years in business",
      "Sustainable practices",
    ],
    
    // Additional services confirmed
    confirmedServices: [
      "Hardscaping",
      "Landscape Lighting",
    ],
    
    // Photo labeling responses
    photoContexts: {
      "photo-0": {
        label: "Completed project",
        customLabel: "Complete backyard transformation with patio and garden",
      },
      "photo-1": {
        label: "Team at work",
        customLabel: "Our crew installing irrigation system",
      },
      "photo-2": {
        label: "Before & After",
        customLabel: "Front yard makeover - drought resistant landscaping",
      },
    },
    
    // Awards they've won
    awards: [
      "Best of Houston 2023 - Landscaping",
      "TNLA Landscape Excellence Award 2022",
      "Angie's List Super Service Award 2021-2023",
    ],
    
    // Team information
    teamSize: "11-20 people",
    
    // Specializations within services
    specializations: [
      { value: "native-plants", label: "Native Texas plants specialist" },
      { value: "water-wise", label: "Water conservation landscaping" },
      { value: "mosquito", label: "Mosquito control systems" },
    ],
    
    // Project examples
    projectExamples: [
      "5,000 sq ft native plant garden with rainwater collection for River Oaks residence",
      "Commercial xeriscape installation reducing water usage by 60% for medical center",
      "Complete outdoor living space with kitchen, fire pit, and mood lighting in Memorial",
    ],
    
    // Differentiators
    differentiators: [
      { value: "eco-friendly", label: "100% organic lawn care option" },
      { value: "water-smart", label: "WaterSense certified professionals" },
      { value: "same-week", label: "Same-week service availability" },
    ],
    
    // Pricing approach
    pricingApproach: "transparent",
    
    // Brand personality
    brandPersonality: "premium",
  },
};

// Run the complete flow
async function demonstrateCompleteFlow() {
  console.log("=== MULTI-SOURCE TEMPLATE SELECTION DEMO ===\n");
  
  // Step 1: Evaluate all data sources
  console.log("1. ANALYZING ALL DATA SOURCES...");
  const insights = multiSourceEvaluator.evaluateAllSources(exampleMultiSourceData);
  
  console.log("\nData Quality by Source:");
  console.log("- GBP Score:", insights.sourceQuality.gbp);
  console.log("- Places Score:", insights.sourceQuality.places);
  console.log("- SERP Score:", insights.sourceQuality.serp);
  console.log("- User Data Score:", insights.sourceQuality.userProvided);
  console.log("- Overall:", insights.sourceQuality.overall);
  
  console.log("\nConfirmed Data:");
  console.log("- Services:", insights.confirmed.services.length);
  console.log("- Photos:", insights.confirmed.photos.length);
  console.log("- Reviews:", insights.confirmed.reviews.count);
  console.log("- Certifications:", insights.confirmed.certifications);
  console.log("- Competitors Analyzed:", insights.confirmed.competitors.length);
  
  // Step 2: Generate intelligent questions
  console.log("\n2. GENERATING INTELLIGENT QUESTIONS...");
  const questions = questionGenerator.generateQuestions(insights, 'landscaping');
  
  console.log("\nQuestions Generated:", questions.length);
  questions.forEach((q, i) => {
    console.log(`\n${i + 1}. ${q.question}`);
    console.log(`   Type: ${q.type}`);
    console.log(`   Context: ${q.context}`);
  });
  
  // Step 3: Select optimal template with all insights
  console.log("\n3. SELECTING OPTIMAL TEMPLATE...");
  const selection = await enhancedTemplateSelector.selectOptimalTemplate(
    exampleMultiSourceData,
    'landscaping'
  );
  
  console.log("\nTemplate Selection:");
  console.log("- Base Template:", selection.selectedTemplate);
  console.log("- Competitive Strategy:", selection.competitiveStrategy.positioning);
  console.log("- Emphasis Areas:", selection.competitiveStrategy.emphasis);
  console.log("\nSection Variants:");
  Object.entries(selection.sectionVariants).forEach(([section, variant]) => {
    console.log(`- ${section}: ${variant}`);
  });
  console.log("\nSection Order:", selection.sectionOrder.join(" → "));
  
  // Step 4: Populate with multi-source data
  console.log("\n4. POPULATING CONTENT WITH ALL DATA SOURCES...");
  const populated = enhancedLandscapingPopulator.populateAllSections(
    selection,
    insights,
    exampleMultiSourceData.serp,
    exampleMultiSourceData.userAnswers
  );
  
  console.log("\nPopulated Sections:");
  
  // Hero Section
  const hero = populated.hero;
  console.log("\n📍 HERO SECTION:");
  console.log("Headline:", hero.content.headline);
  console.log("Subheadline:", hero.content.subheadline);
  console.log("CTA:", hero.content.primaryCTA.text);
  console.log("Trust Signals:", hero.content.trustSignals);
  console.log("Data Sources:", hero.metadata.dataSource);
  
  // Services Section
  const services = populated.services;
  console.log("\n🔧 SERVICES SECTION:");
  console.log("Headline:", services.content.headline);
  services.content.services.slice(0, 3).forEach(service => {
    console.log(`\n- ${service.name}`);
    console.log(`  Description: ${service.description.substring(0, 80)}...`);
    console.log(`  Features: ${service.features.join(", ")}`);
    if (service.badge) console.log(`  Badge: ${service.badge}`);
  });
  
  // Trust Section
  if (populated.trust) {
    const trust = populated.trust;
    console.log("\n✅ TRUST SECTION:");
    trust.content.items.forEach(item => {
      console.log(`- ${item.icon} ${item.title}${item.verified ? ' ✓' : ''}`);
    });
  }
  
  // Gallery Section
  if (populated.gallery) {
    const gallery = populated.gallery;
    console.log("\n📸 GALLERY SECTION:");
    console.log("Total Photos:", gallery.content.items.length);
    console.log("Categories:", gallery.content.categories);
    gallery.content.items.slice(0, 3).forEach(photo => {
      console.log(`- ${photo.title}: ${photo.caption || photo.alt}`);
    });
  }
  
  console.log("\n5. COMPETITIVE ADVANTAGES UTILIZED:");
  console.log("- Unique Services:", selection.competitiveStrategy.differentiators);
  console.log("- Market Gaps Addressed:", ["Native plants", "Water conservation", "Mosquito control"]);
  console.log("- Trust Differentiators:", ["Award-winning", "20 years experience", "Organic options"]);
  
  console.log("\n6. SEO OPTIMIZATION:");
  const allKeywords = new Set<string>();
  Object.values(populated).forEach(section => {
    section.metadata.seoKeywords.forEach(kw => allKeywords.add(kw));
  });
  console.log("Target Keywords:", Array.from(allKeywords).join(", "));
}

// Expected Output Summary:
/*
The system will:
1. Analyze all 4 data sources and score quality
2. Generate only relevant questions (not asking what we already know)
3. Select premium template due to awards and high photo count
4. Choose section variants that emphasize competitive advantages
5. Populate content that highlights unique services competitors don't offer
6. Include user-provided context for photos and awards
7. Optimize for local SEO with SERP insights
*/

demonstrateCompleteFlow();
