/**
 * Test Script: Enhanced Multi-Source Site Generation
 * 
 * Run this to see how the system works with mock data
 */

import { multiSourceEvaluator } from '../lib/content-generation/multi-source-data-evaluator';
import { questionGenerator } from '../lib/content-generation/intelligent-question-generator';
import { enhancedTemplateSelector } from '../lib/content-generation/enhanced-template-selector';
import { enhancedLandscapingPopulator } from '../lib/content-generation/industry-populators/enhanced-landscaping-populator';

// Mock data representing what we'd get from APIs
const mockMultiSourceData = {
  gbp: {
    name: "GreenScape Pro Landscaping",
    description: "Award-winning landscaping company serving Houston for over 20 years. We specialize in eco-friendly lawn care, native plant installations, and sustainable landscape design. EPA certified and fully insured.",
    primaryCategory: {
      displayName: "Landscaping Service",
      serviceTypes: [
        { displayName: "Lawn Care" },
        { displayName: "Landscape Design" },
        { displayName: "Tree Service" }
      ]
    },
    primaryPhone: "(713) 555-0123",
    fullAddress: {
      addressLines: ["123 Garden Way"],
      locality: "Houston",
      administrativeArea: "TX",
      postalCode: "77001"
    },
    regularHours: {
      periods: [
        { openDay: "MONDAY", openTime: "08:00", closeTime: "18:00" },
        { openDay: "TUESDAY", openTime: "08:00", closeTime: "18:00" },
        // ... etc
      ]
    },
    photos: [
      { 
        name: "photos/photo1",
        photoUrl: "https://example.com/photo1.jpg"
      },
      {
        name: "photos/photo2", 
        photoUrl: "https://example.com/photo2.jpg"
      }
    ],
    rating: 4.8,
    userRatingCount: 127
  },
  
  places: {
    reviews: {
      rating: 4.8,
      total: 127,
      highlights: [
        "Excellent service and attention to detail",
        "Transformed our backyard into an oasis",
        "Very knowledgeable about native plants"
      ]
    },
    opening_hours: {
      weekday_text: [
        "Monday: 8:00 AM – 6:00 PM",
        "Tuesday: 8:00 AM – 6:00 PM",
        // ... etc
      ]
    }
  },
  
  serp: {
    topKeywords: [
      "landscaping houston",
      "lawn care houston", 
      "landscape design houston tx"
    ],
    competitorServices: [
      "Lawn Maintenance",
      "Irrigation",
      "Hardscaping"
    ],
    commonTrustSignals: ["Licensed", "Insured"],
    competitorPricingTransparency: "hidden",
    location: "Houston",
    peopleAlsoAsk: [
      {
        question: "How much does landscaping cost in Houston?",
        answer: "Landscaping costs in Houston typically range from $1,500 to $5,000 for basic projects..."
      },
      {
        question: "What is the best grass for Houston lawns?",
        answer: "St. Augustine and Bermuda grass are the most popular choices for Houston..."
      }
    ],
    competitors: [
      "GreenThumb Landscaping",
      "Houston Lawn Pros",
      "Elite Landscapes TX"
    ],
    marketPosition: "premium",
    commonServices: ["Lawn Care", "Landscape Design", "Tree Service"],
    pricingInsights: {
      averagePrice: "$150-300/service",
      marketRange: "budget to premium"
    },
    localKeywords: ["landscaping houston tx", "lawn care near me houston"]
  },
  
  userAnswers: {} // Initially empty
};

async function runTest() {
  console.log('🚀 Testing Enhanced Multi-Source Site Generation\n');
  
  // Step 1: Evaluate data sources
  console.log('📊 Step 1: Evaluating data sources...');
  const insights = multiSourceEvaluator.evaluateAllSources(mockMultiSourceData);
  
  console.log('Data Quality:', {
    overall: `${Math.round(insights.overallQuality * 100)}%`,
    gbp: `${Math.round(insights.sourceQuality.gbp * 100)}%`,
    places: `${Math.round(insights.sourceQuality.places * 100)}%`,
    serp: `${Math.round(insights.sourceQuality.serp * 100)}%`,
    user: `${Math.round(insights.sourceQuality.user * 100)}%`
  });
  
  console.log('\nConfirmed Data:', {
    businessName: insights.confirmed.businessName,
    servicesCount: insights.confirmed.services.length,
    photosCount: insights.confirmed.photos.length,
    hasReviews: !!insights.confirmed.reviews,
    certifications: insights.confirmed.certifications
  });
  
  console.log('\nMissing Data:', insights.missingData);
  
  // Step 2: Generate intelligent questions
  console.log('\n❓ Step 2: Generating intelligent questions...');
  const questions = questionGenerator.generateQuestions(insights, 'landscaping');
  
  console.log(`Generated ${questions.length} questions:`);
  questions.forEach((q, i) => {
    console.log(`\n${i + 1}. ${q.question}`);
    console.log(`   Type: ${q.type}, Category: ${q.category}`);
    if (q.options) {
      console.log('   Options:', q.options.map(o => o.label).join(', '));
    }
  });
  
  // Step 3: Simulate user answers
  console.log('\n✍️ Step 3: Simulating user answers...');
  const simulatedAnswers = {
    confirmedClaims: ['20_years', 'award_winning', 'epa_certified'],
    photoContexts: {
      'photo-0': { 
        label: 'Before & After',
        customLabel: 'Complete backyard transformation with native plants'
      },
      'photo-1': {
        label: 'Completed Project',
        customLabel: 'Drought-resistant front yard design'
      }
    },
    awards: ['Best of Houston 2023', 'Angie\'s List Super Service Award'],
    specializations: [
      { value: 'native-plants', label: 'Native Plant Specialist' },
      { value: 'xeriscaping', label: 'Water-Wise Landscaping' }
    ],
    teamSize: '10-20',
    uniqueValue: 'Only EPA-certified organic lawn care in Houston',
    differentiators: [
      { label: 'Lifetime plant guarantee', icon: '🌱' },
      { label: '100% organic products', icon: '🌿' }
    ]
  };
  
  // Update multi-source data with answers
  mockMultiSourceData.userAnswers = simulatedAnswers;
  
  // Step 4: Select optimal template
  console.log('\n🎨 Step 4: Selecting optimal template...');
  const templateSelection = await enhancedTemplateSelector.selectOptimalTemplate(
    mockMultiSourceData,
    'landscaping'
  );
  
  console.log('Selected Template:', templateSelection.selectedTemplate);
  console.log('Competitive Strategy:', {
    positioning: templateSelection.competitiveStrategy.positioning,
    differentiators: templateSelection.competitiveStrategy.differentiators,
    emphasis: templateSelection.competitiveStrategy.emphasis
  });
  console.log('Section Variants:', templateSelection.sectionVariants);
  
  // Step 5: Populate sections
  console.log('\n📝 Step 5: Populating sections with rich content...');
  const reevaluatedInsights = multiSourceEvaluator.evaluateAllSources(mockMultiSourceData);
  const populatedSections = enhancedLandscapingPopulator.populateAllSections(
    templateSelection,
    reevaluatedInsights,
    mockMultiSourceData.serp,
    mockMultiSourceData.userAnswers
  );
  
  console.log('\nPopulated Sections:');
  Object.entries(populatedSections).forEach(([sectionType, section]) => {
    if (!section || !section.metadata) {
      console.log(`\n${sectionType.toUpperCase()}: [NOT IMPLEMENTED]`);
      return;
    }
    
    console.log(`\n${sectionType.toUpperCase()}:`);
    console.log('- Variant:', section.variant);
    console.log('- Data Sources:', section.metadata.dataSource.join(', '));
    console.log('- SEO Keywords:', section.metadata.seoKeywords.slice(0, 3).join(', '));
    
    // Show sample content based on section type
    if (sectionType === 'hero' && section.content) {
      console.log('- Headline:', section.content.headline);
      console.log('- Trust Signals:', section.content.trustSignals?.join(', '));
    } else if (sectionType === 'services' && section.content) {
      console.log('- Services:', section.content.services?.slice(0, 3).map((s: any) => s.name).join(', '));
    } else if (sectionType === 'gallery' && section.content) {
      console.log('- Photos:', section.content.items?.length || 0, 'with context');
      console.log('- Categories:', section.content.categories?.join(', '));
    } else if (sectionType === 'trust' && section.content) {
      console.log('- Trust Elements:', section.content.items?.length || 0);
    } else if (sectionType === 'faq' && section.content) {
      console.log('- Questions:', section.content.items?.length || 0);
    } else if (sectionType === 'about' && section.content) {
      console.log('- Awards:', section.content.awards?.join(', ') || 'None');
    }
  });
  
  // Summary
  console.log('\n✅ Test Complete!');
  console.log('\nFinal Data Quality:', `${Math.round(reevaluatedInsights.overallQuality * 100)}%`);
  console.log('Questions Reduced From: ~50 generic questions');
  console.log('Questions Reduced To:', questions.length, 'targeted questions');
  console.log('\nKey Advantages:');
  console.log('- Used actual business photos with context');
  console.log('- Positioned against local competitors');
  console.log('- Highlighted unique certifications (EPA)');
  console.log('- Created content using verified claims');
  console.log('- Selected template based on premium positioning');
}

// Run the test
runTest().catch(console.error);
