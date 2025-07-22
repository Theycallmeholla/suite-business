#!/bin/bash
# Quick fix script to update the Places API integration

echo "📦 Backing up original files..."
cp app/api/places/details/route.ts app/api/places/details/route.ts.backup
cp lib/gbp-enrichment.ts lib/gbp-enrichment.ts.backup

echo "🔧 Applying fixes..."

# Copy the fixed files
cp app/api/places/details/route-fixed.ts app/api/places/details/route.ts
cp lib/gbp-enrichment-fixed.ts lib/gbp-enrichment.ts

echo "✅ Fixes applied!"
echo ""
echo "📝 Summary of changes:"
echo "1. Fixed field name: user_ratings_total → userRatingCount"
echo "2. Added X-Goog-FieldMask header for Places API v1"
echo "3. Added better error handling for invalid Place IDs"
echo "4. Created /api/places/search endpoint for refreshing Place IDs"
echo ""
echo "🚀 Next steps:"
echo "1. Restart your Next.js dev server"
echo "2. Test with a valid Place ID"
echo "3. If you get invalid Place ID errors, use the search endpoint to get a fresh one"
