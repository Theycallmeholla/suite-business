# Google Business Profile (GBP) Field Mapping to Smart Intake

**Created**: June 28, 2025, 10:00 PM CST
**Last Updated**: June 28, 2025, 10:30 PM CST

This document outlines the mapping between Google Business Profile (GBP) fields and our internal Smart Intake fields. This mapping is crucial for suppressing redundant questions during the onboarding process, leveraging data already available from GBP.

| GBP Field | Our Field | Confidence Rule | Suppress Question? | Edge cases / notes (≤ 40 chars) |
|---|---|---|---|---|
| `primaryPhone` | `dataScore.phone` | If exists and is valid format | ✅ Yes | May be marketing/tracking number |
| `metadata.openingDate.year` | `businessAge` | If exists and is a valid year | ✅ Yes | Recent opening dates need context |
| `address.addressLines` | `streetAddress` | If exists, valid, and not service-area-only | ✅ Yes | Service-area-only vs. storefront |
| `serviceArea.radius` | `radius` | If radius > 0 or polygon/zip present | ✅ Yes | Polygon/zip fallback needed |
| `regularHours.periods` | `businessHours` | If any day has valid hours | ✅ Yes | Special hours not covered |
| `categories.primaryCategory.displayName` | `industry` | If mapped to a known industry with high confidence | ✅ Yes | Mapping to our taxonomy is key |
| `websiteUri` | `website` | If exists and is a valid URL | ✅ Yes | May be a social media page |
| `profile.description` or `description` | `businessDescription` | If length > 100 chars and not generic | ✅ Yes | Generic descriptions are low value |
| `adWordsLocationExtensions.phoneNumber` | `secondaryPhone` | If exists and is valid format | ✅ Yes | Often a tracking number |
| `menuUrl` | `menuUrl` | If exists and is a valid URL | ✅ Yes | Only for food/restaurant businesses |
| `serviceArea.places` | `serviceAreaCities` | If city list > 0 | ✅ Yes | City list, not radius/polygon |
| `photos` | `businessImages` | If count > 0 | ✅ Yes | Quality/relevance varies |
| `attributes` | `businessFeatures` | If relevant attributes exist | ✅ Yes | Highly category-dependent |
| `url` (social links) | `socialLinks` | If valid social media URLs exist | ✅ Yes | Requires parsing for platform |

## Sketchy or Fringe Mappings / Considerations:

*   **Multi-location records**: How do we handle businesses with multiple GBP locations? The current mapping assumes a single primary location. We might need a strategy to select the most relevant location or aggregate data from multiple locations.
*   **City-list based service areas**: GBP can define service areas by a list of cities. Our `serviceArea.radius` mapping assumes a radius or polygon. We need to consider how to translate city lists into a usable radius or if we need a different approach for such cases.
*   **Phone buried in subarray**: While `primaryPhone` is directly mapped, sometimes phone numbers might be present in other less direct fields or arrays within the GBP data. We should ensure our extraction logic is robust enough to capture these.
*   **`metadata.openingDate.year`**: The confidence rule "If ≤ currentYear - 1" is a good start, but we should also consider cases where the opening date might be very recent, in which case we might still want to ask about "years in business" for more context.
*   **`address.addressLines`**: The rule "If lines exist and not service-area-only" is important. We need to ensure we don't suppress the address question if the GBP listing is purely service-area based without a physical storefront address.
*   **`categories.primaryCategory.displayName`**: The mapping "If mapped to one of ours" implies a predefined list of industries. We need to ensure this mapping is comprehensive and accurate to avoid miscategorization or unnecessary questions.

## Fringe Listings / Weird Cases:

*   **Businesses with no physical address**: Many service-area businesses (e.g., plumbers, electricians) operate without a public storefront. Their GBP listings might only have service areas, leading to `address.addressLines` being empty or generic.
*   **Businesses with multiple phone numbers**: Some businesses list multiple phone numbers (e.g., main line, emergency line, fax, tracking numbers). We need to prioritize `primaryPhone` but also consider if secondary numbers are relevant.
*   **Businesses with generic websites**: Many small businesses might link to a Facebook page, a Yelp profile, or a generic directory listing instead of a dedicated website. This impacts the confidence of inferring email or other details from the `websiteUri`.
*   **Businesses with no categories or very broad categories**: Some GBP listings might lack specific categories or use very general ones, making it difficult to accurately map to our internal industry taxonomy.
*   **Businesses with very short or keyword-stuffed descriptions**: The `profile.description` field can sometimes be very brief, or filled with keywords for SEO, making it less useful for generating rich content.
*   **Businesses with inconsistent hours**: Listings with partial hours (e.g., only open on weekends) or special holiday hours that aren't `regularHours.periods` can be tricky.
*   **Businesses with unverified or outdated information**: GBP data can sometimes be old or unverified, leading to inaccurate addresses, phone numbers, or hours. Our system should ideally have a mechanism to flag or handle such cases.
*   **Businesses with multiple GBP listings**: Some businesses might have duplicate or multiple GBP listings for the same physical location, which can lead to conflicting data.
*   **Businesses with phone numbers embedded in description**: Sometimes, contact information like phone numbers or emails are not in their designated fields but are instead written within the business description or other text fields.