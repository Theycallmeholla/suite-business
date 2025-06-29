# Smart Intake Implementation

**Created**: June 28, 2025, 8:45 PM CST  
**Last Updated**: June 28, 2025, 8:45 PM CST

## Overview

The Smart Intake feature reduces onboarding questions from 20+ to <5 by intelligently pre-selecting commonly expected services based on business location and climate zone.

## Implementation Status

✅ **Backend Implementation** (Complete)
- Climate zone detection based on latitude/longitude
- Service prevalence data by industry and climate
- Smart question generation with pre-checked options
- Feature flag support (SMART_INTAKE_ENABLED)

✅ **Frontend Integration** (Complete)
- Enhanced onboarding page wired to `/api/intelligence/questions`
- QuestionFlowOrchestrator supports smart intake API
- MultipleChoice component supports pre-checked options
- Visual indicators for "Smart pick ✨" services

## Key Files Modified

### Backend
- `/lib/data/industryExpectations.json` - Service prevalence by industry/climate
- `/lib/utils/region-detector.ts` - Climate zone detection
- `/lib/utils/service-normalizer.ts` - Service name normalization
- `/app/api/intelligence/questions/route.ts` - Smart intake logic

### Frontend
- `/app/onboarding/enhance/page.tsx` - Calls smart intake API
- `/components/SmartQuestionComponents/QuestionFlowOrchestrator.tsx` - API integration
- `/components/SmartQuestionComponents/MultipleChoice.tsx` - Pre-checked support

## How It Works

1. **Climate Detection**: Based on business coordinates, determines climate zone (ARID, COLD, HUMID, etc.)
2. **Service Analysis**: Checks which services the business already offers via GBP data
3. **Smart Pre-selection**: Pre-checks services with >70% prevalence for that industry/climate
4. **Visual Feedback**: Shows "Smart pick ✨" badge on pre-selected services

## Testing

Access the test page at: http://localhost:3000/dev/test-smart-intake

Test scenarios:
- **Phoenix Landscaper**: Pre-selects xeriscaping, drip irrigation (arid climate)
- **Boston Landscaper**: Pre-selects snow removal, winterization (cold climate)  
- **Houston HVAC**: Pre-selects humidity control, dehumidification (humid climate)

## Environment Variables

```bash
# Enable smart intake feature
SMART_INTAKE_ENABLED=true

# Prevalence threshold (default 0.7)
INTAKE_EXPECTED_THRESHOLD=0.7
```

## Future Enhancements

As mentioned by Holliday:
- Auto-compute service radius from GBP service area polygons
- Scrape/infer founding year to skip "years in business" question
- Further reduce generic text input questions

## Analytics

When enabled, tracks:
- Climate zone detected
- Services pre-selected
- Expectations version (for A/B testing)
- User modifications to pre-selections