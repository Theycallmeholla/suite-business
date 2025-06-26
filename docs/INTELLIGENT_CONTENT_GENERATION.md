# Intelligent Content Generation System

**Created**: June 23, 2025, 9:08 AM CST  
**Last Updated**: June 23, 2025, 9:08 AM CST

## Overview

The Intelligent Content Generation System dynamically creates website content based on business data richness and user responses to engaging smart questions. It adapts content depth and quality based on available information, ensuring every business gets an optimized website regardless of initial data availability.

## Architecture

### 1. Data Collection & Scoring

#### Data Sources
1. **Google Business Profile (Primary)**
   - Business name, description, categories
   - Hours, contact information
   - Reviews and ratings
   - Photos and media
   - Attributes (licensed, women-owned, etc.)

2. **Google Places API (Enhanced)**
   - Additional photos
   - Popular times
   - Price levels
   - Service options

3. **Smart Questions (Gap Filling)**
   - Services offered
   - Unique differentiators
   - Business personality
   - Visual preferences

#### Scoring Algorithm (`/lib/intelligence/scoring.ts`)
```typescript
// 0-100 point scale across 5 categories (20 points each)
{
  basicInfo: 20,      // Name, description, hours, contact
  content: 20,        // Services, about, specializations
  visuals: 20,        // Photos, logo, videos
  trust: 20,          // Reviews, ratings, years in business
  differentiation: 20 // Awards, certifications, unique features
}

// Content tiers based on total score
Premium (70-100): Rich, detailed content with all sections
Standard (40-69): Moderate content with core sections
Minimal (0-39): Basic content with essential sections
```

### 2. Smart Question System

#### Question Components

1. **TinderSwipe** - Yes/No questions with swipe gestures
   - Features: Undo, "I don't know", skip if known
   - Use: Binary decisions, feature presence

2. **ThisOrThat** - Binary choice between two options
   - Features: Split screen, animated selection
   - Use: Value propositions, positioning

3. **StylePicker** - Visual style selection
   - Features: Live previews, multiple types (font/color/layout)
   - Use: Design preferences

4. **FontPairing** - Typography combination selector
   - Features: Carousel/comparison views, industry recommendations
   - Use: Brand personality through typography

5. **MultipleChoice** - Flexible multi/single select
   - Features: Cards/buttons/chips variants, limits
   - Use: Services, features, preferences

#### Question Intelligence

```typescript
// Question filtering based on known data
filterQuestionsBasedOnKnownData(questions, businessData)

// Skip examples:
- Skip "50+ reviews?" if GBP shows they have them
- Skip "business hours?" if already in GBP
- Skip "licensed?" if in GBP attributes

// Handle uncertainty
allowUnsure: true // Shows "I don't know" option
handleUnsureResponses() // Tracks for follow-up
```

### 3. Content Generation Pipeline

#### Phase 1: Data Analysis
```typescript
// Analyze all available data
const intelligence = await analyzeBusinessData({
  gbpData,
  placesData,
  userAnswers,
  industryType
})

// Calculate richness score
const score = calculateDataScore(intelligence)
```

#### Phase 2: Question Generation
```typescript
// Generate questions to fill gaps
const questions = await generateSmartQuestions({
  dataScore: score,
  missingData: intelligence.gaps,
  industry: businessType
})

// Filter out known information
const filtered = filterQuestionsBasedOnKnownData(
  questions, 
  intelligence
)
```

#### Phase 3: Content Assembly
```typescript
// Select sections based on score
const sections = selectSectionsForTier(score.tier)

// Generate content for each section
const content = await generateSectionContent({
  sections,
  intelligence,
  industryProfile
})

// Optimize for SEO
const optimized = await optimizeSEO(content, intelligence)
```

## Implementation Details

### Database Schema

```prisma
model BusinessIntelligence {
  id           String   @id @default(cuid())
  businessName String
  placeId      String?
  site         Site?    @relation(fields: [siteId], references: [id])
  siteId       String?  @unique
  
  // Data storage
  dataScore    Json     // Scoring breakdown
  gbpData      Json?    // Google Business Profile
  placesData   Json?    // Enhanced Places data
  serpData     Json?    // Search results data
  userAnswers  Json?    // Question responses
  
  // Generated content
  generatedSections Json?  // AI-generated sections
  seoMetadata      Json?  // Generated SEO data
}

model SmartQuestion {
  id         String   @id @default(cuid())
  businessId String
  question   String
  answer     Json
  category   String
}
```

### API Endpoints

- `POST /api/intelligence/analyze` - Analyze business data
- `GET /api/intelligence/score/{intelligenceId}` - Get scores
- `POST /api/intelligence/questions` - Generate questions
- `POST /api/intelligence/answers` - Store responses
- `POST /api/intelligence/generate` - Generate content

### Industry Profiles (`/lib/intelligence/industry-profiles.ts`)

Each industry has specific:
- SEO keywords and strategies
- Common services and specializations
- Trust signals and conversion elements
- Content patterns and priorities

Supported industries:
- Landscaping
- HVAC
- Plumbing
- Cleaning
- Roofing
- Electrical
- General (fallback)

## Usage Flow

### 1. Onboarding Integration

```typescript
// After business selection/creation
const intelligence = await createBusinessIntelligence({
  businessName,
  placeId,
  gbpData,
  siteId
})

// Analyze and score
const analysis = await analyzeBusinessData(intelligence)

// If score < 70, show smart questions
if (analysis.score.total < 70) {
  redirect(`/onboarding/enhance/${intelligence.id}`)
}
```

### 2. Smart Questions Flow

```typescript
// Load questions based on gaps
const questions = await getSmartQuestions(intelligenceId)

// Present with appropriate UI
<QuestionFlow questions={questions}>
  <TinderSwipe questions={yesNoQuestions} />
  <MultipleChoice question={serviceQuestion} />
  <FontPairing pairings={fontOptions} />
  <StylePicker options={colorSchemes} />
</QuestionFlow>

// Save responses
await saveQuestionResponses(intelligenceId, answers)
```

### 3. Content Generation

```typescript
// Generate initial content
const content = await generateContent(intelligenceId)

// Create/update site sections
await updateSiteSections(siteId, content.sections)

// Apply SEO metadata
await updateSiteSEO(siteId, content.seoMetadata)
```

## Progressive Enhancement

The system supports continuous improvement:

1. **Initial Launch** - Basic content from available data
2. **Post-Launch** - Prompt for missing information
3. **Ongoing** - Track engagement, suggest improvements
4. **Evolution** - Add new data sources, refine content

## Best Practices

### 1. Question Design
- Keep questions simple and binary when possible
- Use visual selection for subjective choices
- Provide "I don't know" for uncertain items
- Skip questions you already know answers to

### 2. Content Generation
- Start with essential sections for minimal data
- Add sections as data richness improves
- Maintain consistency with industry standards
- Optimize for local SEO from the start

### 3. User Experience
- Make questions feel like a game, not a form
- Show progress and time estimates
- Allow saving and resuming later
- Celebrate completion with immediate results

## Testing

### Development Tools
- Demo page: `/dev/smart-questions`
- API testing: Use provided curl examples
- Database viewer: `npm run db:studio`

### Quality Checks
1. Verify question filtering works correctly
2. Test all question component interactions
3. Validate content generation for each tier
4. Check mobile responsiveness
5. Ensure accessibility compliance

## Future Enhancements

1. **AI Integration**
   - GPT-4 for content writing
   - Claude for conversational questions
   - DALL-E for image generation

2. **Advanced Analytics**
   - Track question completion rates
   - A/B test question formats
   - Measure content effectiveness

3. **Automation**
   - Auto-update from GBP changes
   - Seasonal content updates
   - Competitor monitoring

## Troubleshooting

### Common Issues

1. **Questions showing already known data**
   - Check `skipIfKnown` flag implementation
   - Verify data parsing in filter function

2. **Low scores despite good data**
   - Review scoring weights
   - Check data normalization
   - Validate category detection

3. **Poor content generation**
   - Ensure industry profile is correct
   - Verify all data sources are connected
   - Check template selection logic

## Related Documentation

- [Site Infrastructure](./SITE_INFRASTRUCTURE.md) - Template system
- [Onboarding](./ONBOARDING.md) - User flow integration
- [Google Integration](./GOOGLE_INTEGRATION.md) - Data sources
- [Template System](./TEMPLATE_SYSTEM.md) - Content rendering