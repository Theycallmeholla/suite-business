# Implementation Guide: Template Variant Selection System

## Overview
This guide explains how to implement the new template variant selection system that replaces content generation with intelligent template selection and population.

## Architecture Changes

### Old Approach (Content Generation)
```typescript
// ❌ OLD: AI generates content from scratch
const content = await aiContentEngine.generateContent({
  sectionType: 'hero',
  contentType: 'headline',
  // ... AI generates new headline
});
```

### New Approach (Template Selection)
```typescript
// ✅ NEW: AI selects template variant and populates with data
const result = await aiContentEngine.generateWebsiteCopy(
  businessData,    // Actual business data
  industry,        // Industry type
  userAnswers      // User preferences
);
// Returns: Selected template, populated sections, optimal order
```

## Implementation Steps

### 1. Update the AI Content Engine Import

**File:** `/lib/orchestration/website-generation-orchestrator.ts`

Replace:
```typescript
import { aiContentEngine } from '@/lib/content-generation/ai-content-engine';
```

With:
```typescript
import { aiContentEngine } from '@/lib/content-generation/ai-template-selection-engine';
```

### 2. Update the Content Generation Method

**File:** `/lib/orchestration/website-generation-orchestrator.ts`

Replace the `generateWebsiteContent` method:

```typescript
private async generateWebsiteContent(
  request: WebsiteGenerationRequest,
  businessData: BusinessIntelligenceData
) {
  try {
    // NEW: Use template selection approach
    const result = await aiContentEngine.generateWebsiteCopy(
      businessData,
      request.industry,
      request.answers
    );
    
    // Store the selection reasoning
    await prisma.contentGeneration.create({
      data: {
        businessIntelligenceId: request.businessIntelligenceId,
        selectedTemplate: result.selectedTemplate,
        sectionVariants: result.sectionOrder,
        dataQuality: result.metadata.dataQuality,
        reasoning: result.metadata.reasoning,
        generatedAt: new Date(),
      },
    });
    
    return result;
  } catch (error) {
    logger.error('Content generation failed', {}, error as Error);
    throw error;
  }
}
```

### 3. Update Template Generation

**File:** `/lib/orchestration/website-generation-orchestrator.ts`

Update the `generateAdaptiveTemplate` method:

```typescript
private async generateAdaptiveTemplate(
  request: WebsiteGenerationRequest,
  businessData: BusinessIntelligenceData,
  generatedContent: any
) {
  // Content now includes selected variants and populated sections
  const { selectedTemplate, populatedSections, sectionOrder } = generatedContent;
  
  // Build the template structure
  const template = {
    id: selectedTemplate,
    sections: sectionOrder.map(sectionType => ({
      type: sectionType,
      variant: populatedSections[sectionType].variant,
      content: populatedSections[sectionType].content,
      metadata: populatedSections[sectionType].metadata,
    })),
  };
  
  return template;
}
```

### 4. Update Site Creation Endpoints

**File:** `/app/api/sites/create-enhanced/route.ts`

Uncomment and implement the `generateSiteFromIntelligence` function:

```typescript
import { aiContentEngine } from '@/lib/content-generation/ai-template-selection-engine';

async function generateSiteFromIntelligence(enhancedData: any) {
  // Generate website using the new selection system
  const result = await aiContentEngine.generateWebsiteCopy(
    enhancedData,
    enhancedData.industry,
    enhancedData.userAnswers || {}
  );
  
  return {
    template: result.selectedTemplate,
    sections: result.populatedSections,
    sectionOrder: result.sectionOrder,
    seoKeywords: result.metadata.seoKeywords,
  };
}
```

### 5. Add Industry Populators

Create populators for each industry following the landscaping example:

**Files to create:**
- `/lib/content-generation/industry-populators/hvac-populator.ts`
- `/lib/content-generation/industry-populators/plumbing-populator.ts`
- `/lib/content-generation/industry-populators/cleaning-populator.ts`

### 6. Update the Data-Driven Content Generator

**File:** `/lib/content-generation/data-driven-content.ts`

Update to use the new system:

```typescript
import { aiContentEngine } from '@/lib/content-generation/ai-template-selection-engine';

export async function generateDataDrivenSections(data: ContentGenerationData): Promise<Section[]> {
  // Use the new AI selection engine
  const result = await aiContentEngine.generateWebsiteCopy(
    data.businessData,
    data.industry,
    data.userAnswers || {}
  );
  
  // Convert to Section format
  return result.sectionOrder.map(sectionType => {
    const section = result.populatedSections[sectionType];
    return {
      id: `${sectionType}-1`,
      type: sectionType,
      order: result.sectionOrder.indexOf(sectionType) + 1,
      visible: true,
      data: section.content,
    };
  });
}
```

## Testing the Implementation

### 1. Test Data Quality Evaluation
```typescript
import { dataEvaluator } from '@/lib/content-generation/data-evaluator';

const testData = {
  // ... business intelligence data
};

const quality = dataEvaluator.evaluateBusinessData(testData);
console.log('Data quality:', quality);
```

### 2. Test Template Selection
```typescript
import { templateSelector } from '@/lib/content-generation/template-variant-selector';

const result = await templateSelector.selectOptimalTemplate(
  businessData,
  'landscaping',
  userAnswers
);
console.log('Selected variants:', result.sectionVariants);
```

### 3. Test Content Population
```typescript
import { landscapingPopulator } from '@/lib/content-generation/industry-populators/landscaping-populator';

const populated = landscapingPopulator.populateAllSections(
  selectedVariants,
  businessData,
  userAnswers,
  dataQuality
);
console.log('Populated content:', populated);
```

## Benefits of This Approach

1. **Predictable Quality**: Templates are pre-designed and tested
2. **Better Performance**: No AI generation needed for basic sites
3. **Industry Compliance**: Content follows industry best practices
4. **SEO Optimized**: Keywords and structure are industry-specific
5. **Scalable**: Easy to add new industries and variants
6. **Cost Effective**: Reduces OpenAI API usage

## Next Steps

1. **Add More Industries**: Create populators for HVAC, plumbing, cleaning
2. **Add More Variants**: Create additional section variants for different scenarios
3. **A/B Testing**: Track which variants perform best
4. **Enhance Selection Logic**: Improve the rules for variant selection
5. **Add Seasonal Content**: Time-based content variations

## Environment Variables

No new environment variables needed! The system works with or without:
```env
OPENAI_API_KEY=sk-... # Optional - enhances selection if available
```

## Rollback Plan

If issues arise, the old system can be restored by:
1. Reverting the import in `website-generation-orchestrator.ts`
2. The new engine maintains backwards compatibility with the old interface

## Support

For questions or issues:
1. Check the logs for selection reasoning
2. Review the data quality scores
3. Verify industry populators are loaded
