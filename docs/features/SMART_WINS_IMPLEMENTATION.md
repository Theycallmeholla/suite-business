# Smart Wins Implementation - Magic Question Suppression

**Created**: June 28, 2025, 9:50 PM CST  
**Last Updated**: June 28, 2025, 9:50 PM CST

## Overview

Enhanced the Smart Intake feature to truly feel magical by automatically extracting data we can infer and suppressing unnecessary questions. This reduces user friction and demonstrates intelligent understanding of their business.

## Implementation Details

### 1. Service Radius Auto-Calculation (`/lib/utils/service-radius-calculator.ts`)
- Calculates service radius from GBP serviceArea polygon data
- Uses Haversine formula to find max distance from center point
- Provides confidence scores (0.95 for polygon, 0.7 for places list, 0.3 for default)
- Only asks radius question if confidence < 0.5

### 2. Business Age Extraction (`/lib/utils/business-age-extractor.ts`)
- Extracts from multiple sources:
  - `metadata.establishedDate` (95% confidence)
  - `yearEstablished` fields (90% confidence)
  - Description text parsing (70% confidence)
- Regex patterns for "Since 1995", "25 years experience", etc.
- Completely suppresses question if any data found

### 3. Question Suppression Logic (`/lib/intelligence/question-suppression.ts`)
- General framework for suppressing questions based on available data
- Tracks suppression reasons for analytics
- Calculates efficiency metrics
- Extensible for future suppressions:
  - Business hours (if in GBP)
  - Phone number (if in GBP)
  - Website (if in GBP)
  - Email (inferred from website domain)

### 4. Enhanced UI Feedback
- **Smart pick badges**: Purple-to-pink gradient with animation
- **Confidence indicators**: Show % confidence on pre-selected options
- **Hover tooltips**: Explain why items were pre-selected
- **Visual prominence**: Larger badges, shadows, spring animations

## Results

### Phoenix Landscaper (Full Data)
- **Before**: 5-6 questions including radius, years, services
- **After**: 2-3 questions (services only, with pre-selections)
- **Suppressed**: Service radius (calculated as 15 miles), Years in business (14 years)

### Boston HVAC (Partial Data)
- **Before**: 5-6 questions
- **After**: 3-4 questions (services + radius)
- **Suppressed**: Years in business (extracted "since 1985" from description)

### Houston Plumber (Minimal Data)
- **Before**: 5-6 questions
- **After**: 4-5 questions (most questions still needed)
- **Limited suppression due to minimal data**

## Analytics Tracking

New events capture suppression efficiency:
```javascript
{
  event: 'smart_intake_questions_suppressed',
  properties: {
    original_count: 6,
    final_count: 3,
    suppressed_count: 3,
    reduction_percentage: 50,
    suppressed_questions: ['service-radius', 'years-in-business', 'business-hours'],
    efficiency: 'high'
  }
}
```

## Testing

Two test pages available:
1. `/dev/test-smart-intake` - Original smart intake with pre-selections
2. `/dev/test-smart-wins` - Enhanced version with question suppression

## Future Enhancements

1. **More Suppressions**:
   - Team size (infer from employee count in GBP)
   - Price range (extract from reviews mentioning prices)
   - Specializations (infer from review keywords)

2. **Smarter Extraction**:
   - Use AI to extract data from unstructured text
   - Cross-reference multiple data sources
   - Learn from user corrections

3. **Progressive Disclosure**:
   - Show "We already know..." summary
   - Let users correct inferred data
   - Build trust through transparency

## Environment Variables

No new environment variables required. Uses existing:
- `SMART_INTAKE_ENABLED=true` - Enable all smart features
- `INTAKE_EXPECTED_THRESHOLD=0.7` - Service pre-selection threshold