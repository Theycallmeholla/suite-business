# Smart Intake Questions System

**Created**: June 28, 2025, 4:40 PM CST  
**Last Updated**: June 28, 2025, 4:40 PM CST

## Overview

The Smart Intake Questions system reduces onboarding friction by intelligently pre-selecting commonly expected services based on a business's location and industry. Instead of asking 20+ questions, users see <5 highly relevant questions with smart defaults.

## How It Works

1. **Climate Detection**: Based on business coordinates, we detect the climate zone (Cold, Arid, Humid, Temperate)
2. **Service Expectations**: We maintain a matrix of service prevalence by industry and climate
3. **Pre-selection**: Services with ≥70% prevalence are automatically pre-checked
4. **Analytics**: Every interaction is tracked for continuous improvement

## Configuration

### Environment Variables

```bash
# Enable/disable the feature
SMART_INTAKE_ENABLED=true

# Threshold for pre-selection (0.0-1.0)
INTAKE_EXPECTED_THRESHOLD=0.7
```

### Data Files

- `/lib/data/industryExpectations.json` - Service prevalence data
- `/lib/utils/region-detector.ts` - Climate zone detection logic
- `/lib/constants/intake.ts` - Configuration constants

## Implementation Details

### Climate Zones

- **CLIMATE_COLD**: Northern states (>40° latitude) - expects snow removal, winterization
- **CLIMATE_ARID**: Southwest (<35° lat, <-98° lng) - expects xeriscaping, water conservation
- **CLIMATE_HUMID**: Southeast (<35° lat, >-98° lng) - expects mold prevention, drainage
- **CLIMATE_TEMPERATE**: Everything else - standard services

### Service Normalization

Services are normalized for consistent matching:
- "Lawn Care" → "lawn_care"
- "24/7 Emergency" → "24_7_emergency"
- "Snow & Ice Removal" → "snow_ice_removal"

## API Integration

The enhancement happens in `/app/api/intelligence/questions/route.ts`:

```typescript
// When SMART_INTAKE_ENABLED=true
1. Load business coordinates from GBP data
2. Detect climate zone
3. Load industry expectations
4. Extract known services from GBP
5. Find missing expected services
6. Pre-check them in the service grid question
```

## Testing

### Unit Tests
```bash
npm test -- smart-intake
```

### Manual Testing
```bash
# See what would be pre-selected for different scenarios
SMART_INTAKE_ENABLED=true npx tsx scripts/test-smart-intake.ts
```

### E2E Tests
```bash
# Test rollback behavior
npm run test:e2e -- smart-intake-rollback
```

## Analytics

Track adoption and impact via:
- Event: `smart_intake_question_rendered`
- Properties:
  - `industry`
  - `climate_zone`
  - `missing_count`
  - `known_count`
  - `expectations_version`

## Rollout Strategy

1. **Deploy with flag OFF** - No user impact
2. **Internal testing** - Enable for team accounts
3. **A/B test** - 10% of new signups
4. **Monitor & adjust** - Check metrics, tune threshold
5. **Full rollout** - Enable for all users

## Success Metrics

- **Question Reduction**: From ~20 to <5 questions (75% reduction)
- **Completion Rate**: +10% improvement
- **Time to Complete**: -60% reduction
- **Service Accuracy**: 85%+ of pre-selected services kept by users

## Troubleshooting

### Services not pre-selecting
1. Check if `SMART_INTAKE_ENABLED=true`
2. Verify business has coordinates in GBP data
3. Check service prevalence in expectations JSON
4. Ensure threshold is appropriate (default 0.7)

### Invalid JSON errors
```bash
# Validate expectations file
npm run lint:json
```

### Climate zone incorrect
- Review coordinates in `/scripts/test-smart-intake.ts`
- Adjust zones in `/lib/utils/region-detector.ts`

## Future Enhancements

- [ ] Use Köppen climate classification for precision
- [ ] Machine learning for prevalence updates
- [ ] Industry-specific thresholds
- [ ] Seasonal adjustments
- [ ] Multi-language support