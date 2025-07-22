# Enhanced Site Generation - API Documentation

## Overview

The Enhanced Site Generation API provides intelligent website creation with 86% fewer questions by leveraging multiple data sources.

## Core APIs

### 1. Generate Questions Endpoint

**POST** `/api/sites/create-from-gbp-enhanced`

Generates smart questions based on available data.

#### Request

```typescript
{
  "locationId": "ChIJnepQB1XGQIYRy455cw3qD-Q", // Place ID or GBP Location
  "generateQuestionsOnly": true,
  "industry": "hvac" // Optional: auto-detected if not provided
}
```

#### Response

```typescript
{
  "questions": [
    {
      "id": "photo-context",
      "type": "photo-label",
      "question": "Help visitors understand your work better. What do these photos show?",
      "category": "photos",
      "priority": "high",
      "required": false,
      "options": [
        { "value": "before", "label": "Before photo" },
        { "value": "after", "label": "After photo" },
        { "value": "before-after", "label": "Before & After" },
        { "value": "in-progress", "label": "Work in progress" }
      ],
      "metadata": {
        "photoCount": 10,
        "photoUrls": ["https://..."]
      }
    }
  ],
  "insights": {
    "overallQuality": 0.75,
    "sourceQuality": {
      "gbp": 0.65,
      "places": 0.15,
      "serp": 0.50,
      "user": 0.00
    },
    "confirmed": {
      "businessName": "Air Tech of Houston",
      "services": ["AC Repair", "Installation", "Plumbing"],
      "photos": [/* photo objects */],
      "reviews": {
        "rating": 4.9,
        "totalCount": 4929
      }
    },
    "missingData": ["awards", "team_size", "differentiators"]
  }
}
```

### 2. Generate Website Endpoint

**POST** `/api/sites/create-from-gbp-enhanced`

Creates the complete website with user answers.

#### Request

```typescript
{
  "locationId": "ChIJnepQB1XGQIYRy455cw3qD-Q",
  "generateQuestionsOnly": false,
  "answers": {
    "photo-context": {
      "photo-0": {
        "label": "before-after",
        "customLabel": "Complete AC system replacement"
      },
      "photo-1": {
        "label": "completed",
        "customLabel": "New ductwork installation"
      }
    },
    "differentiators": [
      { "label": "24/7 Emergency Service", "icon": "🚨" },
      { "label": "5-Year Warranty", "icon": "✅" }
    ],
    "specializations": ["emergency-hvac", "commercial"],
    "uniqueValue": "Only HVAC company in Houston with same-day service guarantee"
  }
}
```

#### Response

```typescript
{
  "success": true,
  "site": {
    "id": "site_123",
    "subdomain": "airtech-houston",
    "url": "https://airtech-houston.yourdomain.com",
    "businessName": "Air Tech of Houston AC & Plumbing",
    "template": "nature-premium",
    "competitiveStrategy": {
      "positioning": "premium",
      "differentiators": ["24/7 service", "5-year warranty"],
      "emphasis": ["emergency", "quality", "trust"]
    }
  },
  "metrics": {
    "questionsShown": 6,
    "dataQuality": 0.85,
    "timeToComplete": 180 // seconds
  }
}
```

## Question Types

### 1. Photo Label (`photo-label`)

For adding context to existing photos.

```typescript
interface PhotoLabelQuestion {
  type: "photo-label";
  metadata: {
    photoCount: number;
    photoUrls: string[];
  };
  options: Array<{
    value: string;
    label: string;
  }>;
}
```

### 2. Multiple Select (`multiple`)

For selecting multiple options.

```typescript
interface MultipleSelectQuestion {
  type: "multiple";
  options: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
  minSelections?: number;
  maxSelections?: number;
}
```

### 3. Single Select (`single`)

For selecting one option.

```typescript
interface SingleSelectQuestion {
  type: "single";
  options: Array<{
    value: string;
    label: string;
  }>;
}
```

### 4. Text Input (`text`)

For open-ended responses.

```typescript
interface TextQuestion {
  type: "text";
  maxLength?: number;
  placeholder?: string;
}
```

### 5. Claim Verification (`confirmClaims`)

For verifying detected claims.

```typescript
interface ClaimQuestion {
  type: "confirmClaims";
  detectedClaims: string[];
  metadata: {
    source: "description" | "reviews" | "website";
  };
}
```

## Data Sources

### Google Business Profile (GBP)

```typescript
interface GBPData {
  name: string;
  description?: string;
  primaryCategory: {
    displayName: string;
    serviceTypes: Array<{displayName: string}>;
  };
  primaryPhone: string;
  fullAddress: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
    postalCode: string;
  };
  regularHours?: {
    periods: Array<{
      openDay: string;
      openTime: string;
      closeTime: string;
    }>;
  };
  photos: Array<{
    name: string;
    photoUrl: string;
  }>;
  rating?: number;
  userRatingCount?: number;
}
```

### Places API Data

```typescript
interface PlacesData {
  reviews: {
    rating: number;
    total: number;
    highlights: string[];
    recentReviews?: Array<{
      text: string;
      rating: number;
      author_name: string;
    }>;
  };
  opening_hours?: {
    weekday_text: string[];
  };
  price_level?: number; // 0-4
}
```

### SERP/Competitive Data

```typescript
interface SERPData {
  topKeywords: string[];
  competitorServices: string[];
  commonTrustSignals: string[];
  competitorPricingTransparency: "shown" | "hidden" | "mixed";
  location: string;
  peopleAlsoAsk: Array<{
    question: string;
    answer: string;
  }>;
  competitors: string[];
  marketPosition: "budget" | "competitive" | "premium";
  localKeywords: string[];
}
```

## Industry-Specific Features

### Supported Industries

- `landscaping` - Full support with specialized questions
- `hvac` - Full support with emergency service focus
- `plumbing` - Full support with service specialization
- `cleaning` - Full support with service area focus
- `roofing` - Coming soon
- `electrical` - Coming soon
- `general` - Fallback for any industry

### Industry Detection

```typescript
function detectIndustry(
  gbpCategory?: string,
  businessName?: string,
  services?: string[]
): string {
  // Detection priority:
  // 1. GBP primary category
  // 2. Business name keywords
  // 3. Services mentioned in reviews
  // 4. Default to 'general'
}
```

## Template Selection

### Strategy Engine

```typescript
interface CompetitiveStrategy {
  positioning: "budget" | "balanced" | "premium";
  differentiators: string[];
  emphasis: string[]; // e.g., ["quality", "speed", "price"]
}
```

### Template Variants

```typescript
interface TemplateSelection {
  selectedTemplate: string; // e.g., "emerald-elegance"
  sectionVariants: {
    hero: "hero-modern" | "hero-classic" | "hero-bold";
    services: "services-grid" | "services-list" | "services-featured";
    gallery: "gallery-grid" | "gallery-slider" | "gallery-masonry";
    testimonials: "testimonials-carousel" | "testimonials-grid";
    // ... more sections
  };
}
```

## Error Handling

### Common Errors

```typescript
// Invalid Place ID
{
  "error": "INVALID_PLACE_ID",
  "message": "The provided Place ID is invalid or not found"
}

// Missing API Key
{
  "error": "MISSING_API_KEY",
  "message": "Google Maps API key is not configured"
}

// Rate Limit
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "API rate limit exceeded. Try again later."
}
```

### Error Recovery

```typescript
try {
  const data = await fetchPlacesData(placeId);
} catch (error) {
  // Fallback to partial data
  const fallbackData = {
    gbp: basicGBPData,
    places: {}, // Empty but valid
    serp: mockSERPData // Use mock competitive data
  };
  
  // Continue with reduced functionality
  return generateWithFallback(fallbackData);
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Cache Place data for 1 hour
const PLACE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Cache SERP data for 24 hours
const SERP_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Cache by location + industry
const cacheKey = `serp:${location}:${industry}`;
```

### Batch Operations

```typescript
// Fetch multiple data sources in parallel
const [gbpData, placesData, serpData] = await Promise.all([
  fetchGBPData(locationId),
  fetchPlacesData(placeId),
  fetchSERPData(businessName, location)
]);
```

## Webhooks & Events

### Available Events

```typescript
// Question generation started
{
  "event": "questions.generated",
  "data": {
    "businessId": "123",
    "questionCount": 6,
    "dataQuality": 0.75
  }
}

// Website creation completed
{
  "event": "website.created",
  "data": {
    "siteId": "site_123",
    "completionTime": 180,
    "questionsAnswered": 6
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { EnhancedSiteGenerator } from '@yourcompany/site-generator';

const generator = new EnhancedSiteGenerator({
  apiKey: 'your_api_key',
  googleMapsKey: 'google_maps_key'
});

// Generate questions
const { questions, insights } = await generator.generateQuestions({
  placeId: 'ChIJnepQB1XGQIYRy455cw3qD-Q'
});

// Create site with answers
const site = await generator.createSite({
  placeId: 'ChIJnepQB1XGQIYRy455cw3qD-Q',
  answers: userAnswers
});
```

### REST API

```bash
# Generate questions
curl -X POST https://api.yourcompany.com/sites/enhanced \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "ChIJnepQB1XGQIYRy455cw3qD-Q",
    "generateQuestionsOnly": true
  }'

# Create site
curl -X POST https://api.yourcompany.com/sites/enhanced \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "ChIJnepQB1XGQIYRy455cw3qD-Q",
    "answers": {
      "differentiators": ["24/7 service", "warranties"]
    }
  }'
```

## Testing

### Test Place IDs

```typescript
const TEST_PLACE_IDS = {
  highData: "ChIJnepQB1XGQIYRy455cw3qD-Q", // 4900+ reviews
  mediumData: "ChIJB4JQbuvFQIYRLu_R3msXkTM", // 100+ reviews
  lowData: "ChIJ15XPEk6_QIYRi3twq-Xsmr8" // <50 reviews
};
```

### Test Scripts

```bash
# Find test businesses
npx tsx scripts/find-place-ids.ts "hvac houston"

# Test question generation
npx tsx scripts/test-real-places-data.ts [PLACE_ID]

# Test full flow
npx tsx scripts/test-comprehensive-analysis.ts [PLACE_ID]
```

---

## Support

For technical support or questions:
- Review test scripts in `/scripts/`
- Check implementation guide
- Contact: support@yourcompany.com
