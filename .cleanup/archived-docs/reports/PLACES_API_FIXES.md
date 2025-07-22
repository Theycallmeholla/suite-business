# Google Places API Integration Fixes

## Issues Identified and Fixed

### 1. Incorrect Field Names in Places API v1

**Problem**: Using `user_ratings_total` which is the old field name from Legacy API
**Solution**: Use `userRatingCount` (camelCase) for the new Places API v1

### 2. Invalid Place ID Error

**Problem**: Place ID `ChIJwetgGtXRQIYRvKyaedY4hF8` is no longer valid
**Solution**: 
- Implement place search functionality to get fresh Place IDs
- Add error handling for invalid Place IDs
- Created `/api/places/search` endpoint to refresh Place IDs

### 3. Missing Field Mask Header

**Problem**: Using query parameter for fields instead of header
**Solution**: Use `X-Goog-FieldMask` header instead of query parameter

### 4. GBP API 404 Errors

**Problem**: Location ID `locations/13185861005569963962` not found
**Possible Causes**:
- Location doesn't exist in the account
- User doesn't have access to this location
- Using wrong account ID

## Complete List of Correct Field Names for Places API v1

### Basic Fields
- `id` - Place ID
- `displayName` - Business name (replaces `name`)
- `primaryType` - Primary business category
- `formattedAddress` - Full address

### Contact Fields
- `nationalPhoneNumber` - National format phone
- `internationalPhoneNumber` - International format phone
- `websiteUri` - Website URL (replaces `website`)

### Location Fields
- `location` - Lat/lng coordinates
- `viewport` - Map viewport
- `plusCode` - Plus code

### Business Info
- `businessStatus` - Operational status
- `googleMapsUri` - Google Maps URL
- `priceLevel` - Price level (0-4)

### Ratings & Reviews
- `rating` - Average rating
- `userRatingCount` - Total ratings (NOT `user_ratings_total`!)
- `reviews` - Array of reviews

### Hours
- `regularOpeningHours` - Regular hours
- `currentOpeningHours` - Current week hours
- `utcOffsetMinutes` - UTC offset

### Service Options
- `delivery`
- `dineIn`
- `curbsidePickup`
- `reservable`
- `takeout`
- `servesBreakfast`
- `servesLunch`
- `servesDinner`
- `servesBeer`
- `servesWine`

### Photos
- `photos` - Array of photos

### Additional Info
- `editorialSummary` - Editorial description
- `accessibilityOptions` - Accessibility features
- `paymentOptions` - Payment methods
- `parkingOptions` - Parking info

## Implementation Steps

1. **Replace your current `/api/places/details/route.ts`** with the fixed version
2. **Update `/lib/gbp-enrichment.ts`** with the fixed version
3. **Create the new `/api/places/search/route.ts`** endpoint
4. **Update your frontend** to handle Place ID refresh:

```typescript
// When you get an INVALID_PLACE_ID error
if (error.code === 'INVALID_PLACE_ID') {
  // Search for the place again
  const searchResult = await fetch('/api/places/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      textQuery: businessName + ' ' + businessAddress,
      maxResultCount: 1
    })
  });
  
  const { places } = await searchResult.json();
  if (places.length > 0) {
    // Update your stored Place ID
    const newPlaceId = places[0].placeId;
    // Retry with new Place ID
  }
}
```

## Testing the Fixes

1. **Test Place Details API**:
```bash
curl -X POST http://localhost:3000/api/places/details \
  -H "Content-Type: application/json" \
  -d '{
    "placeId": "YOUR_PLACE_ID",
    "fields": "displayName,rating,userRatingCount,photos,reviews"
  }'
```

2. **Test Place Search API**:
```bash
curl -X POST http://localhost:3000/api/places/search \
  -H "Content-Type: application/json" \
  -d '{
    "textQuery": "Starbucks Houston",
    "maxResultCount": 5
  }'
```

## Debugging Tips

1. **Check Place ID format**: Should be like `ChIJ...` (no prefixes)
2. **Verify API Key**: Ensure Places API (New) is enabled in Google Cloud Console
3. **Check field names**: Use exact camelCase names from the list above
4. **Monitor logs**: The logger will show detailed error information

## Next Steps

1. Update all references to old field names in your codebase
2. Implement Place ID refresh logic when you get invalid ID errors
3. Consider caching Place IDs with expiration (e.g., 30 days)
4. Add retry logic for transient API errors
