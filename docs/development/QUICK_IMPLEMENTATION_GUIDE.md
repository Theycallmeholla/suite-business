# Quick Implementation Guide: Multi-Source Template System

## 🚀 Getting Started

### 1. Update Imports

Replace the old AI content engine with the new multi-source system:

```typescript
// ❌ Remove old imports
import { aiContentEngine } from '@/lib/content-generation/ai-content-engine';

// ✅ Add new imports
import { multiSourceEvaluator } from '@/lib/content-generation/multi-source-data-evaluator';
import { questionGenerator } from '@/lib/content-generation/intelligent-question-generator';
import { enhancedTemplateSelector } from '@/lib/content-generation/enhanced-template-selector';
import { enhancedLandscapingPopulator } from '@/lib/content-generation/industry-populators/enhanced-landscaping-populator';
```

### 2. Prepare Multi-Source Data

```typescript
// Combine all data sources
const multiSourceData = {
  gbp: gbpApiResponse,           // From Google Business Profile API
  places: placesApiResponse,      // From Google Places API
  serp: dataForSeoResponse,       // From DataForSEO API
  userAnswers: previousAnswers,   // From user form/database
};
```

### 3. Generate Smart Questions

```typescript
// Analyze data and generate only necessary questions
const insights = multiSourceEvaluator.evaluateAllSources(multiSourceData);
const questions = questionGenerator.generateQuestions(insights, industry);

// Questions will include:
// - Claim confirmations (from description)
// - Photo labeling (with actual photos)
// - Missing data (awards, team info)
// - Specializations within services
```

### 4. Process User Responses

```typescript
// After user answers questions
multiSourceData.userAnswers = {
  ...previousAnswers,
  ...newAnswers,
  
  // Special handling for photo labeling
  photoContexts: {
    'photo-0': {
      label: 'Completed project',
      customLabel: 'Backyard transformation with new patio'
    },
    // ... more photos
  },
  
  // Awards they confirmed
  awards: ['Best of Houston 2023', 'BBB A+ Rating'],
  
  // Confirmed claims
  confirmedClaims: ['20 years experience', 'Award-winning'],
};
```

### 5. Select and Populate Template

```typescript
// Select optimal template with competitive strategy
const selection = await enhancedTemplateSelector.selectOptimalTemplate(
  multiSourceData,
  industry
);

// Populate with all data sources
const populatedSections = enhancedLandscapingPopulator.populateAllSections(
  selection,
  insights,
  multiSourceData.serp,
  multiSourceData.userAnswers
);

// Result includes:
// - Competitive positioning
// - Rich content from all sources
// - Photo galleries with context
// - Services with market advantages
// - Trust signals with awards
```

### 6. Generate Final Website

```typescript
const website = {
  template: selection.selectedTemplate,
  sections: selection.sectionOrder.map(sectionType => ({
    type: sectionType,
    variant: selection.sectionVariants[sectionType],
    content: populatedSections[sectionType].content,
    seo: populatedSections[sectionType].metadata.seoKeywords,
  })),
  metadata: {
    competitiveStrategy: selection.competitiveStrategy,
    dataQuality: insights.sourceQuality,
    uniqueFeatures: selection.competitiveStrategy.differentiators,
  },
};
```

## 📊 Data Structure Examples

### Photo with Context
```typescript
{
  url: "https://gbp-photos.com/photo1.jpg",
  context: {
    label: "Before & After",
    customLabel: "Complete front yard drought-resistant makeover",
    tags: ["xeriscape", "water-conservation", "native-plants"]
  }
}
```

### Service with Competitive Data
```typescript
{
  name: "Native Plant Landscaping",
  description: "Specializing in Texas native plants that thrive in Houston's climate",
  features: ["Drought resistant", "Low maintenance", "Wildlife friendly"],
  keywords: ["native plants houston", "xeriscape", "drought resistant landscaping"],
  badge: "Exclusive Service", // If competitors don't offer
  source: ["gbp", "user"], // Where data came from
}
```

### Trust Signal with Verification
```typescript
{
  type: "award",
  title: "Best of Houston 2023",
  icon: "🏆",
  verified: true, // User confirmed this
  source: "user"
}
```

## 🎯 Key Principles

1. **Never Ask What You Know** - If it's in the APIs, don't ask
2. **Confirm, Don't Assume** - Verify claims found in descriptions
3. **Context Matters** - Let users explain their photos
4. **Compete Smart** - Use SERP data to find advantages
5. **Combine Everything** - Use all data sources together

## ⚡ Quick Wins

### 1. Photo Labeling UI
```typescript
// Show actual photos for labeling
<PhotoGrid>
  {insights.confirmed.photos.map(photo => (
    <PhotoLabel
      key={photo.id}
      src={photo.url}
      options={['Before', 'After', 'Completed', 'Team']}
      allowCustom={true}
      onChange={(label) => updatePhotoContext(photo.id, label)}
    />
  ))}
</PhotoGrid>
```

### 2. Claim Verification
```typescript
// Extract and verify claims
const claims = extractClaimsFromDescription(gbp.description);
<ClaimChecker claims={claims} onConfirm={updateConfirmedClaims} />
```

### 3. Competitive Advantages
```typescript
// Highlight what competitors don't offer
const uniqueServices = ourServices.filter(s => 
  !competitors.some(c => c.services.includes(s))
);
<ServiceBadge type="exclusive">Only we offer this!</ServiceBadge>
```

## 🐛 Common Issues

### Issue: Too Many Questions
**Solution**: Check data evaluation - you might be missing API data

### Issue: Generic Content
**Solution**: Ensure all 4 data sources are properly connected

### Issue: No Competitive Advantage
**Solution**: Check SERP data is being fetched and analyzed

### Issue: Photos Without Context
**Solution**: Implement photo labeling question interface

## 📈 Success Metrics

- Questions per user: Should be < 10 (not 50+)
- Data source utilization: All 4 sources contributing
- Unique content: No duplicate headlines across sites
- Competitive positioning: Clear differentiation from SERP competitors
- Photo context: 80%+ of photos should have labels

## 🔗 Related Documentation

- [Multi-Source Data Evaluator](/lib/content-generation/multi-source-data-evaluator.ts)
- [Intelligent Question Generator](/lib/content-generation/intelligent-question-generator.ts)
- [Enhanced Template Selector](/lib/content-generation/enhanced-template-selector.ts)
- [Enhanced Content Populators](/lib/content-generation/industry-populators/)
