/**
 * Demo: Enhanced Site Generation System
 * Shows how the system works with realistic data (no API keys required)
 */

import { multiSourceEvaluator } from '../lib/content-generation/multi-source-data-evaluator';
import { questionGenerator } from '../lib/content-generation/intelligent-question-generator';
import { enhancedTemplateSelector } from '../lib/content-generation/enhanced-template-selector';
import { enhancedLandscapingPopulator } from '../lib/content-generation/industry-populators/enhanced-landscaping-populator';

// Simulate real data from different businesses
const DEMO_BUSINESSES = {
  highQuality: {
    name: "Premier Lawn & Landscape",
    scenario: "Established business with strong online presence",
    data: {
      gbp: {
        name: "Premier Lawn & Landscape",
        description: "Houston's premier landscaping company since 2005. Award-winning designs, certified professionals, and eco-friendly practices. We transform outdoor spaces into beautiful, sustainable landscapes.",
        primaryCategory: {
          displayName: "Landscaping Service",
          serviceTypes: [
            { displayName: "Lawn Care" },
            { displayName: "Landscape Design" },
            { displayName: "Irrigation" },
            { displayName: "Hardscaping" }
          ]
        },
        primaryPhone: "(713) 555-9876",
        fullAddress: {
          addressLines: ["456 Oak Boulevard"],
          locality: "Houston",
          administrativeArea: "TX",
          postalCode: "77056"
        },
        regularHours: {
          periods: [
            { openDay: "MONDAY", openTime: "07:00", closeTime: "18:00" },
            { openDay: "TUESDAY", openTime: "07:00", closeTime: "18:00" },
            { openDay: "WEDNESDAY", openTime: "07:00", closeTime: "18:00" },
            { openDay: "THURSDAY", openTime: "07:00", closeTime: "18:00" },
            { openDay: "FRIDAY", openTime: "07:00", closeTime: "17:00" },
            { openDay: "SATURDAY", openTime: "08:00", closeTime: "15:00" }
          ]
        },
        photos: Array(8).fill(null).map((_, i) => ({
          name: `photos/photo${i}`,
          photoUrl: `https://example.com/photo${i}.jpg`
        })),
        rating: 4.9,
        userRatingCount: 342,
        website: "https://premierlawnhouston.com"
      },
      places: {
        reviews: {
          rating: 4.9,
          total: 342,
          highlights: [
            "Absolutely transformed our backyard - couldn't be happier!",
            "Professional, punctual, and the results speak for themselves",
            "Best landscaping company in Houston, hands down"
          ],
          recentReviews: [
            {
              text: "Premier Lawn & Landscape completely transformed our property. From the initial design consultation to the final walk-through, everything was perfect.",
              rating: 5,
              author_name: "Sarah Mitchell"
            },
            {
              text: "They installed our irrigation system and new sod. Very knowledgeable about water conservation. Highly recommend!",
              rating: 5,
              author_name: "David Chen"
            }
          ]
        },
        opening_hours: {
          weekday_text: [
            "Monday: 7:00 AM – 6:00 PM",
            "Tuesday: 7:00 AM – 6:00 PM",
            "Wednesday: 7:00 AM – 6:00 PM",
            "Thursday: 7:00 AM – 6:00 PM",
            "Friday: 7:00 AM – 5:00 PM",
            "Saturday: 8:00 AM – 3:00 PM",
            "Sunday: Closed"
          ]
        }
      },
      serp: {
        topKeywords: [
          "landscaping houston",
          "lawn care houston tx",
          "landscape design houston",
          "irrigation houston"
        ],
        competitorServices: [
          "Lawn Maintenance",
          "Landscape Design",
          "Irrigation",
          "Hardscaping",
          "Tree Service",
          "Outdoor Lighting"
        ],
        commonTrustSignals: ["Licensed", "Insured", "BBB A+", "Certified", "Award-winning"],
        competitorPricingTransparency: "mixed",
        location: "Houston",
        peopleAlsoAsk: [
          {
            question: "How much does landscaping cost in Houston?",
            answer: "Landscaping costs in Houston typically range from $3,000 to $15,000 for complete yard makeovers..."
          },
          {
            question: "What is the best time to plant in Houston?",
            answer: "In Houston's climate, fall (October-November) is ideal for planting trees and shrubs..."
          }
        ],
        competitors: [
          "GreenScapes Houston",
          "Elite Landscaping TX",
          "Houston Garden Masters"
        ],
        marketPosition: "premium",
        pricingInsights: {
          averagePrice: "$200-500/service",
          marketRange: "standard to premium"
        }
      }
    }
  },
  
  mediumQuality: {
    name: "Mike's Lawn Care",
    scenario: "Small business with basic online presence",
    data: {
      gbp: {
        name: "Mike's Lawn Care",
        description: "Reliable lawn care service in Houston. Weekly mowing, trimming, and basic landscaping.",
        primaryCategory: {
          displayName: "Lawn Care Service",
          serviceTypes: [
            { displayName: "Lawn Mowing" },
            { displayName: "Trimming" }
          ]
        },
        primaryPhone: "(713) 555-1234",
        fullAddress: {
          addressLines: ["789 Pine Street"],
          locality: "Houston",
          administrativeArea: "TX",
          postalCode: "77001"
        },
        regularHours: {
          periods: [
            { openDay: "MONDAY", openTime: "08:00", closeTime: "17:00" },
            { openDay: "TUESDAY", openTime: "08:00", closeTime: "17:00" },
            { openDay: "WEDNESDAY", openTime: "08:00", closeTime: "17:00" },
            { openDay: "THURSDAY", openTime: "08:00", closeTime: "17:00" },
            { openDay: "FRIDAY", openTime: "08:00", closeTime: "17:00" }
          ]
        },
        photos: Array(2).fill(null).map((_, i) => ({
          name: `photos/photo${i}`,
          photoUrl: `https://example.com/photo${i}.jpg`
        })),
        rating: 4.3,
        userRatingCount: 28
      },
      places: {
        reviews: {
          rating: 4.3,
          total: 28,
          highlights: [
            "Good service, fair prices",
            "Always on time"
          ]
        }
      },
      serp: {
        topKeywords: ["lawn care houston", "mowing service houston"],
        competitorServices: ["Lawn Mowing", "Edging", "Leaf Removal"],
        commonTrustSignals: ["Licensed", "Insured"],
        competitorPricingTransparency: "hidden",
        location: "Houston",
        competitors: ["Quick Cut Lawn Service", "Green Grass Houston"],
        marketPosition: "budget"
      }
    }
  }
};

// Select which business to demo
const selectedBusiness = process.argv[2] === 'medium' ? 'mediumQuality' : 'highQuality';
const demoData = DEMO_BUSINESSES[selectedBusiness];

async function runDemo() {
  console.log('🎯 Enhanced Site Generation System Demo\n');
  console.log('━'.repeat(60));
  console.log(`📊 Scenario: ${demoData.scenario}`);
  console.log(`🏢 Business: ${demoData.name}`);
  console.log('━'.repeat(60) + '\n');
  
  // Transform to multi-source format
  const multiSourceData = {
    ...demoData.data,
    userAnswers: {}
  };
  
  // Step 1: Evaluate data
  console.log('📊 Step 1: Evaluating all data sources...\n');
  const insights = multiSourceEvaluator.evaluateAllSources(multiSourceData);
  
  // Create visual quality bars
  const createBar = (value: number) => {
    const filled = Math.round(value * 20);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };
  
  console.log('Data Quality Scores:');
  console.log(`Overall:  ${createBar(insights.overallQuality)} ${Math.round(insights.overallQuality * 100)}%`);
  console.log(`GBP:      ${createBar(insights.sourceQuality.gbp)} ${Math.round(insights.sourceQuality.gbp * 100)}%`);
  console.log(`Places:   ${createBar(insights.sourceQuality.places)} ${Math.round(insights.sourceQuality.places * 100)}%`);
  console.log(`SERP:     ${createBar(insights.sourceQuality.serp)} ${Math.round(insights.sourceQuality.serp * 100)}%`);
  
  console.log('\nWhat we already know:');
  console.log(`✓ Business name: ${insights.confirmed.businessName}`);
  console.log(`✓ Services: ${insights.confirmed.services.join(', ')}`);
  console.log(`✓ Photos: ${insights.confirmed.photos.length} available`);
  console.log(`✓ Reviews: ${insights.confirmed.reviews?.totalCount || 0} reviews (${insights.confirmed.reviews?.rating || 0}⭐)`);
  console.log(`✓ Trust signals: ${insights.confirmed.certifications.join(', ') || 'None found'}`);
  
  console.log('\nWhat we need to know:');
  console.log(`✗ ${insights.missingData.join(', ') || 'Nothing - we have everything!'}`);
  
  // Step 2: Generate questions
  console.log('\n\n❓ Step 2: Generating smart questions...\n');
  const questions = questionGenerator.generateQuestions(insights, 'landscaping');
  
  console.log(`📉 Question Reduction: 50+ generic → ${questions.length} targeted questions\n`);
  
  questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.question}`);
    console.log(`   📊 Type: ${q.type} | Priority: ${q.priority || 'medium'}`);
    if (q.metadata?.reasoning) {
      console.log(`   💡 Why: ${q.metadata.reasoning}`);
    }
    if (q.options && q.options.length > 0) {
      console.log(`   🔘 Options: ${q.options.slice(0, 4).map(o => o.label).join(', ')}${q.options.length > 4 ? '...' : ''}`);
    }
    console.log('');
  });
  
  // Step 3: Simulate answers
  console.log('💬 Step 3: Simulating user answers...\n');
  
  // Different answers based on business quality
  if (selectedBusiness === 'highQuality') {
    multiSourceData.userAnswers = {
      confirmedClaims: ['licensed', 'insured', 'award_winning', 'certified'],
      photoContexts: {
        'photo-0': { label: 'Before & After', customLabel: 'Complete backyard transformation' },
        'photo-1': { label: 'Completed Project', customLabel: 'Award-winning garden design' },
        'photo-2': { label: 'Team at work', customLabel: 'Our certified crew installing irrigation' }
      },
      awards: ['Houston Chronicle Best of 2023', 'BBB Torch Award', 'TNLA Certified'],
      specializations: [
        { value: 'water-conservation', label: 'Water Conservation Expert' },
        { value: 'native-plants', label: 'Native Plant Specialist' },
        { value: 'outdoor-lighting', label: 'Landscape Lighting Design' }
      ],
      uniqueValue: 'Houston\'s only landscaping company with both TNLA certification and EPA WaterSense partnership',
      differentiators: [
        { label: '100% Satisfaction Guarantee', icon: '✅' },
        { label: 'Water Conservation Experts', icon: '💧' },
        { label: 'Award-Winning Designs', icon: '🏆' }
      ]
    };
  } else {
    multiSourceData.userAnswers = {
      confirmedClaims: ['licensed', 'insured'],
      uniqueValue: 'Honest, reliable lawn care at fair prices',
      differentiators: [
        { label: 'Same-day quotes', icon: '⚡' },
        { label: 'No contracts required', icon: '📝' }
      ]
    };
  }
  
  // Re-evaluate with answers
  const finalInsights = multiSourceEvaluator.evaluateAllSources(multiSourceData);
  console.log(`✅ Data quality after answers: ${Math.round(finalInsights.overallQuality * 100)}%\n`);
  
  // Step 4: Select template and strategy
  console.log('🎨 Step 4: Selecting optimal template & competitive strategy...\n');
  const templateSelection = await enhancedTemplateSelector.selectOptimalTemplate(
    multiSourceData,
    'landscaping'
  );
  
  console.log(`Selected Template: ${templateSelection.selectedTemplate}`);
  console.log(`\nCompetitive Strategy:`);
  console.log(`├─ Market Position: ${templateSelection.competitiveStrategy.positioning}`);
  console.log(`├─ Key Differentiators: ${templateSelection.competitiveStrategy.differentiators.slice(0, 3).join(', ')}`);
  console.log(`└─ Content Focus: ${templateSelection.competitiveStrategy.emphasis.join(', ')}`);
  
  console.log(`\nSection Variants:`);
  Object.entries(templateSelection.sectionVariants).forEach(([section, variant]) => {
    console.log(`├─ ${section}: ${variant}`);
  });
  
  // Step 5: Show populated content
  if (selectedBusiness === 'highQuality') {
    console.log('\n\n📝 Step 5: Sample populated content...\n');
    
    const populatedSections = enhancedLandscapingPopulator.populateAllSections(
      templateSelection,
      finalInsights,
      multiSourceData.serp,
      multiSourceData.userAnswers
    );
    
    if (populatedSections.hero?.content) {
      console.log('HERO SECTION:');
      console.log(`Headline: "${populatedSections.hero.content.headline}"`);
      console.log(`Subheadline: "${populatedSections.hero.content.subheadline}"`);
      console.log(`Trust Signals: ${populatedSections.hero.content.trustSignals?.join(' • ')}`);
    }
  }
  
  // Summary
  console.log('\n\n🎉 Demo Complete!\n');
  console.log('━'.repeat(60));
  console.log('📈 Results Summary:');
  console.log(`├─ Questions: ${questions.length} targeted (vs 50+ generic)`);
  console.log(`├─ Time saved: ~12 minutes per site`);
  console.log(`├─ Data used: ${Object.values(insights.dataUsed).filter(v => v).length} sources integrated`);
  console.log(`├─ Content quality: ${Math.round(finalInsights.overallQuality * 100)}% complete`);
  console.log(`└─ Strategy: ${templateSelection.competitiveStrategy.positioning} positioning`);
  console.log('━'.repeat(60));
  
  console.log('\n💡 Try different scenarios:');
  console.log('   npx tsx scripts/demo-enhanced-system.ts          # High-quality business');
  console.log('   npx tsx scripts/demo-enhanced-system.ts medium   # Basic business\n');
}

// Run the demo
runDemo().catch(console.error);
