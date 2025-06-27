# Enhanced Multi-Source Template Selection System

## Overview

This enhanced system intelligently uses ALL four data sources to generate high-converting, comprehensive websites:

1. **Google Business Profile API** - Business details, services, photos, attributes
2. **Places API** - Reviews, photos, popular times, price level
3. **DataForSEO SERP** - Competitor analysis, keyword gaps, market insights
4. **User Form Data** - Confirmations, context, awards, differentiators

## Key Improvements

### 1. **Intelligent Question Generation**

The system now ONLY asks questions we don't already know:

```typescript
// ❌ OLD: Generic questions
"What services do you offer?"
"Do you have any certifications?"

// ✅ NEW: Smart questions based on data
"We found these claims in your description. Which are accurate?"
- [x] Award-winning
- [x] 20 years in business
- [ ] Certified arborist

"Help us showcase your work. What do these photos show?"
[Shows actual photos from GBP for labeling]
```

### 2. **Multi-Source Data Evaluation**

Evaluates quality from ALL sources:

```typescript
Data Quality Scores:
- GBP: 85/100 (has photos, services, description)
- Places: 75/100 (good reviews, photos)
- SERP: 70/100 (competitor insights, keywords)
- User: 90/100 (awards, photo context, specializations)
Overall: RICH
```

### 3. **Competitive Strategy Selection**

Uses SERP data to position against competitors:

```typescript
Competitive Analysis:
- Competitors emphasize: "Cheap", "No contracts"
- Market gaps: Native plants, Water conservation
- Our strategy: Premium quality + Unique services
- Emphasis: Awards, Certifications, Specializations
```

### 4. **Enhanced Content Population**

Combines all data sources intelligently:

```typescript
// Hero headline uses confirmed award claim
"Award-Winning Landscape Design"

// Services include user-confirmed additions
Services: [
  "Lawn Care" (from GBP),
  "Hardscaping" (user confirmed),
  "Native Plant Specialist" (user specialization),
  "Mosquito Control" (market gap from SERP)
]

// Photos have user-provided context
Gallery: [
  {
    url: "photo1.jpg",
    caption: "Complete backyard transformation with patio",
    category: "Completed project"
  }
]
```

## Implementation Files

### Core Components:

1. **Multi-Source Data Evaluator**
   - Path: `/lib/content-generation/multi-source-data-evaluator.ts`
   - Evaluates all 4 data sources
   - Identifies what needs confirmation
   - Calculates quality scores

2. **Intelligent Question Generator**
   - Path: `/lib/content-generation/intelligent-question-generator.ts`
   - Only asks what we don't know
   - Photo labeling with actual photos
   - Confirms claims found in descriptions

3. **Enhanced Template Selector**
   - Path: `/lib/content-generation/enhanced-template-selector.ts`
   - Uses competitive insights from SERP
   - Selects variants based on all data
   - Creates competitive positioning strategy

4. **Enhanced Content Populators**
   - Path: `/lib/content-generation/industry-populators/enhanced-landscaping-populator.ts`
   - Populates with data from all sources
   - Highlights competitive advantages
   - Uses photo context from users

## Data Flow

```
1. Fetch Data from All Sources
   ├── GBP API → Business details, services, photos
   ├── Places API → Reviews, ratings, photos
   ├── SERP API → Competitors, keywords, gaps
   └── User Previous Answers → Basic info

2. Analyze & Evaluate
   ├── Combine similar data (deduplicate)
   ├── Score quality of each source
   ├── Identify claims needing confirmation
   └── Find data gaps

3. Generate Smart Questions
   ├── Confirm unverified claims
   ├── Label unlabeled photos
   ├── Ask about missing data (awards)
   └── Get competitive differentiators

4. Select Optimal Template
   ├── Analyze competitive landscape
   ├── Choose positioning strategy
   ├── Select template variants
   └── Order sections optimally

5. Populate with Rich Content
   ├── Use actual business data
   ├── Add user confirmations
   ├── Highlight unique services
   └── Include competitive advantages
```

## Example Questions Generated

Based on the data analysis, here are examples of SMART questions:

### 1. Claim Confirmation
```
We noticed these statements about your business. Which are accurate?
□ Award-winning landscape design
□ 20+ years of experience  
□ Certified irrigation specialist
□ Eco-friendly practices
```

### 2. Photo Labeling
```
Help visitors understand your work better. What do these photos show?
[Photo Grid with actual GBP photos]
- Photo 1: [Dropdown: Before/After/Completed/Team/etc]
  Custom label: ________________
```

### 3. Awards (only if not mentioned)
```
Have you won any awards or special recognition?
+ Best of Houston 2023
+ Add another...
```

### 4. Specializations
```
For Lawn Care, what are your specialties?
□ Organic/Chemical-free
□ Sports turf management
□ HOA properties
□ Commercial properties
```

## Benefits

1. **No Redundant Questions** - Never asks what APIs already tell us
2. **Competitive Advantage** - Uses SERP data to differentiate
3. **Rich Content** - Combines all data sources effectively
4. **Photo Context** - Users can explain what photos show
5. **Smart Fallbacks** - Industry-specific content when data is missing

## Next Steps

1. **Add More Industries** - Create populators for HVAC, plumbing, cleaning
2. **A/B Testing** - Track which competitive strategies work best
3. **Dynamic Updates** - Refresh SERP data monthly for market changes
4. **Photo AI** - Auto-label photos using vision AI
5. **Review Mining** - Extract more insights from review text

This system ensures every website is:
- **Data-driven** (uses actual business information)
- **Competitive** (addresses market gaps)
- **Comprehensive** (10+ sections, not 3)
- **Unique** (no two sites look the same)
- **High-converting** (optimized based on what works)
