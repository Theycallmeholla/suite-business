# Google Business Profile (GBP) Field Mapping to Smart Intake

**Created**: June 28, 2025, 10:00 PM CST
**Last Updated**: June 28, 2025, 10:00 PM CST

This document outlines the mapping between Google Business Profile (GBP) fields and our internal Smart Intake fields. This mapping is crucial for suppressing redundant questions during the onboarding process, leveraging data already available from GBP.

| GBP Field | Our Field | Confidence Rule | Suppress Question? |
|---|---|---|---|
| `primaryPhone` | `dataScore.phone` | If exists | ✅ Yes |
| `metadata.openingDate.year` | `businessAge` | If ≤ currentYear - 1 | ✅ Yes |
| `address.addressLines` | `streetAddress` | If lines exist and not service-area-only | ✅ Yes |
| `serviceArea.radius` | `radius` | If polygon or zip fallback present | ✅ Yes |
| `regularHours.periods` | `businessHours` | If any day has hours | ✅ Yes |
| `categories.primaryCategory.displayName` | `industry` | If mapped to one of ours | ✅ Yes |
| `websiteUri` | `website` | If exists | ✅ Yes |
| `profile.description` or `description` | `businessDescription` | If description length > 100 characters | ✅ Yes |

## Sketchy or Fringe Mappings / Considerations:

*   **Multi-location records**: How do we handle businesses with multiple GBP locations? The current mapping assumes a single primary location. We might need a strategy to select the most relevant location or aggregate data from multiple locations.
*   **City-list based service areas**: GBP can define service areas by a list of cities. Our `serviceArea.radius` mapping assumes a radius or polygon. We need to consider how to translate city lists into a usable radius or if we need a different approach for such cases.
*   **Phone buried in subarray**: While `primaryPhone` is directly mapped, sometimes phone numbers might be present in other less direct fields or arrays within the GBP data. We should ensure our extraction logic is robust enough to capture these.
*   **`metadata.openingDate.year`**: The confidence rule "If ≤ currentYear - 1" is a good start, but we should also consider cases where the opening date might be very recent, in which case we might still want to ask about "years in business" for more context.
*   **`address.addressLines`**: The rule "If lines exist and not service-area-only" is important. We need to ensure we don't suppress the address question if the GBP listing is purely service-area based without a physical storefront address.
*   **`categories.primaryCategory.displayName`**: The mapping "If mapped to one of ours" implies a predefined list of industries. We need to ensure this mapping is comprehensive and accurate to avoid miscategorization or unnecessary questions.
