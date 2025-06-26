# Landscaping Research Data Format for LLM Processing

## Preferred JSON Structure for Research Data

```json
{
  "researchMetadata": {
    "researchDate": "2024-12-19",
    "market": "Houston, TX",
    "researcherNotes": "Any important observations"
  },
  
  "competitorAnalysis": [
    {
      "companyName": "Green Thumb Landscaping",
      "website": "www.greenthumbhouston.com",
      "analysisDate": "2024-12-19",
      
      // SITE STRUCTURE - For understanding information architecture
      "siteStructure": {
        "primaryNav": ["Home", "Services", "About", "Gallery", "Contact"],
        "footerNav": ["Privacy Policy", "Service Areas", "Careers"],
        "hasBlog": false,
        "hasOnlineBooking": true,
        "hasCustomerPortal": false
      },
      
      // SERVICES - Critical for understanding market offerings
      "services": {
        "mainCategories": [
          {
            "name": "Lawn Care",
            "slug": "lawn-care",
            "subServices": [
              "Mowing & Edging",
              "Fertilization (6-step program)",
              "Weed Control"
            ],
            "pricingDisplay": "From $35/visit",
            "hasDetailPage": true
          },
          {
            "name": "Landscape Design",
            "slug": "landscape-design",
            "subServices": [
              "3D Design Services",
              "Plant Installation",
              "Mulch & Rock"
            ],
            "pricingDisplay": "Free Consultation",
            "hasDetailPage": true
          }
        ],
        "uniqueServices": [
          "Mosquito Control",
          "Christmas Light Installation",
          "Artificial Turf"
        ],
        "servicePresentation": "grid", // grid, list, tabs
        "totalServicesCount": 15
      },
      
      // CONTENT ANALYSIS - For generating competitive content
      "contentAnalysis": {
        "heroSection": {
          "headline": "Transform Your Outdoor Space",
          "subheadline": "Houston's Premier Landscaping Since 2005",
          "ctaText": "Get Free Estimate",
          "hasVideo": false,
          "imageType": "before-after" // static, slider, before-after, video
        },
        
        "aboutSection": {
          "hasSection": true,
          "yearsInBusiness": 18,
          "teamSize": "20+ employees",
          "ownershipType": "Family Owned",
          "storyFocus": "three-generation", // founder, team, community, mission
          "certifications": [
            "Licensed & Insured",
            "NALP Member",
            "BBB A+ Rating"
          ]
        },
        
        "trustElements": {
          "displayedCredentials": [
            "Licensed & Insured",
            "Free Estimates",
            "Satisfaction Guaranteed",
            "Same Crew Every Time"
          ],
          "socialProof": {
            "reviewsShown": true,
            "platform": "Google",
            "averageRating": 4.8,
            "reviewCount": 156,
            "featuredReviews": 3
          },
          "guarantees": [
            "100% Satisfaction Guarantee",
            "24-hour response time"
          ],
          "awards": [
            "Best of Houston 2023",
            "Angie's List Super Service"
          ]
        }
      },
      
      // CONVERSION ELEMENTS - For optimizing lead generation
      "conversionElements": {
        "primaryCTA": {
          "text": "Get Free Estimate",
          "placement": ["header", "hero", "sticky"],
          "style": "button" // button, phone, form
        },
        "contactMethods": {
          "phone": {
            "displayed": true,
            "position": "header",
            "clickToCall": true
          },
          "form": {
            "fields": ["name", "email", "phone", "service", "address", "message"],
            "estimatedLength": "medium", // short, medium, long
            "hasFileUpload": true
          },
          "chat": {
            "hasChat": false,
            "type": null // "bot", "live", "hybrid"
          },
          "text": {
            "offered": true,
            "number": "(713) 555-TEXT"
          }
        },
        "leadMagnets": [
          "Free Lawn Analysis",
          "Seasonal Maintenance Guide"
        ],
        "urgencyTactics": [
          "Book by March 1st for 20% off",
          "Limited slots available"
        ]
      },
      
      // VISUAL STYLE - For template selection
      "visualAnalysis": {
        "designStyle": "modern-clean", // modern-clean, traditional, bold, minimal, rustic
        "colorScheme": {
          "primary": "#2D5016",
          "secondary": "#8BC34A",
          "accent": "#FFC107",
          "neutrals": ["#FFFFFF", "#F5F5F5", "#333333"]
        },
        "typography": {
          "headingStyle": "sans-serif bold",
          "bodyStyle": "sans-serif regular"
        },
        "imagery": {
          "quality": "professional", // stock, professional, mixed, amateur
          "primaryTypes": ["before-after", "crew-working", "finished-projects"],
          "hasVideos": true,
          "gallerySize": "25+"
        },
        "layoutDensity": "spacious", // dense, balanced, spacious
        "animations": "subtle" // none, subtle, moderate, heavy
      },
      
      // SEO INTELLIGENCE - For content optimization
      "seoData": {
        "title": "Landscaping Houston TX | Lawn Care Services | Green Thumb",
        "metaDescription": "Professional landscaping and lawn care in Houston. Free estimates, licensed & insured. Call (713) 555-0123 for service.",
        "h1Text": "Houston's Premier Landscaping Company",
        "urlStructure": "service-based", // service-based, location-based, flat
        "targetKeywords": [
          "landscaping houston",
          "houston lawn care",
          "landscape design houston tx"
        ]
      },
      
      // STANDOUT FEATURES - For competitive differentiation
      "notableFeatures": [
        "Before/after slider on every service page",
        "Service area checker tool",
        "Seasonal maintenance calendar",
        "Project cost calculator"
      ]
    }
  ],
  
  // MARKET INTELLIGENCE - Understanding local landscape
  "marketIntelligence": {
    "searchResults": {
      "searchTerm": "landscaping houston tx",
      "searchDate": "2024-12-19",
      
      "paidResults": [
        {
          "position": 1,
          "company": "Houston Lawn Pros",
          "headline": "Houston Landscaping - 50% Off First Service",
          "displayUrl": "houstonlawnpros.com",
          "callouts": ["Free Estimates", "Same Day Service", "Licensed"],
          "sitelinks": ["Lawn Care", "Tree Service", "Get Quote"]
        }
      ],
      
      "organicResults": [
        {
          "position": 1,
          "company": "Green Scapes Houston",
          "title": "Houston Landscaping Services | Professional Lawn Care",
          "description": "Transform your yard with Houston's top-rated landscaping company. 15+ years experience. Free estimates.",
          "url": "www.greenscapeshouston.com",
          "richSnippets": {
            "rating": 4.9,
            "reviews": 287,
            "priceRange": "$$"
          }
        }
      ],
      
      "localPack": [
        {
          "position": 1,
          "company": "Premier Lawns Houston",
          "rating": 4.8,
          "reviewCount": 156,
          "yearsInBusiness": "12 years",
          "responseTime": "Responds in 1 hour",
          "categories": ["Landscaper", "Lawn care service"],
          "highlightedReview": "Best lawn service in Houston! They transformed our yard."
        }
      ],
      
      "peopleAlsoAsk": [
        "How much does landscaping cost in Houston?",
        "What is the best time to plant in Houston?",
        "Do I need a permit for landscaping in Houston?",
        "How often should I water my lawn in Houston?"
      ]
    },
    
    // PATTERNS - For strategic decisions
    "marketPatterns": {
      "commonServices": [
        {
          "service": "Lawn Maintenance",
          "offeredBy": "95%",
          "averagePriceShown": "$35-60/visit"
        },
        {
          "service": "Landscape Design",
          "offeredBy": "75%",
          "averagePriceShown": "Free Consultation"
        }
      ],
      
      "pricingTransparency": {
        "showPrices": "20%",
        "showStartingPrices": "35%",
        "hideAllPrices": "45%"
      },
      
      "trustSignalFrequency": {
        "licensed": "90%",
        "insured": "85%",
        "freeEstimates": "95%",
        "guaranteed": "60%",
        "familyOwned": "40%"
      },
      
      "designTrends": [
        "Mobile-first responsive design",
        "Before/after galleries",
        "Service area maps",
        "Seasonal service reminders",
        "Online quote forms over phone"
      ],
      
      "emergingServices": [
        "Smart irrigation systems",
        "Organic lawn care programs",
        "Outdoor living spaces",
        "Landscape lighting",
        "Mosquito control"
      ]
    }
  },
  
  // CONTENT OPPORTUNITIES - For unique positioning
  "contentOpportunities": {
    "underservedTopics": [
      "Houston-specific plant guides",
      "Hurricane prep for landscapes",
      "Water conservation landscaping",
      "HOA compliance guides"
    ],
    
    "seasonalOpportunities": {
      "spring": ["Azalea care", "St. Augustine grass prep"],
      "summer": ["Drought management", "Chinch bug control"],
      "fall": ["Winter rye overseeding", "Fall color plants"],
      "winter": ["Freeze protection", "Winter pruning"]
    },
    
    "localKeywordGaps": [
      "affordable landscaping houston",
      "emergency tree removal houston",
      "french drain installation houston",
      "houston native plants landscaping"
    ]
  }
}
```

## Why This Format Works Best for LLM Processing:

### 1. **Structured Hierarchy**
- Clear sections for different analysis types
- Consistent naming conventions
- Nested data that mirrors decision logic

### 2. **Quantifiable Data**
- Percentages for market patterns
- Specific counts (services, reviews, etc.)
- Categorical classifications (design style, pricing strategy)

### 3. **Direct Comparisons**
- Same structure for each competitor
- Market-wide patterns separate from individual analysis
- Clear differentiation opportunities

### 4. **Actionable Insights**
- Content gaps identified
- Keyword opportunities listed
- Design trends noted

## How to Use This Data:

```typescript
// Example LLM prompt using this data
const prompt = `
Analyze this landscaping market research and recommend:

1. Which template to use based on visual analysis trends
2. What services to emphasize based on market patterns
3. How to differentiate from these competitors
4. What trust signals are essential
5. Content opportunities to pursue

Research data:
${JSON.stringify(researchData, null, 2)}

Consider:
- Market saturation of services
- Pricing transparency norms
- Design style prevalence
- Unique positioning opportunities
`;
```

## Alternative: Simplified CSV Format

If JSON is too complex for researchers, a simplified CSV could work:

```csv
Company,Services_Count,Price_Shown,Design_Style,Review_Rating,Unique_Features
Green Thumb,15,From $35,modern-clean,4.8,"Before/after slider;Cost calculator"
Houston Lawns,12,Hidden,traditional,4.6,"Online booking;24/7 support"
```

But JSON is preferred because it:
- Captures relationships between data
- Allows for detailed nested information
- Is easier for LLM to parse and understand context
- Maintains data integrity

Would you prefer the full JSON format, a simplified version, or a different structure entirely?
