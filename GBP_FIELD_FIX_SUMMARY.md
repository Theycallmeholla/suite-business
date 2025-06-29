# 🚨 GBP FIELD MISREAD - CRITICAL FIX SUMMARY

## The Issue
Frontend code is using **WRONG field paths** to read GBP data, causing the system to think data is missing when it's actually present. This is blocking the entire smart intake pipeline!

## Quick Fix Resources

### 1. Debug Tool (RUN THIS FIRST!)
```bash
node scripts/debug-gbp-structure.js
```
This shows the ACTUAL field structure in the GBP API response.

### 2. Reference Files Created
- `docs/GBP_FIELD_MIGRATION.js` - Shows wrong vs correct paths
- `components/reference/GBPDataDisplay.tsx` - Reference React component
- `FIX_GBP_FIELDS_NOW.md` - Complete fix checklist

### 3. Main Changes Needed

| What | Wrong Path | Correct Path |
|------|------------|--------------|
| Phone | `locationData.phoneNumbers?.primaryPhone` | `locationData.primaryPhone` |
| Website | `locationData.websiteUri` | `locationData.website` |
| Address | `locationData.storefrontAddress` | `locationData.address \|\| locationData.fullAddress` |

### 4. Test Location
```
locations/2315391108903134470
```

### 5. Expected Results After Fix
- Data richness score: 70+ (not 0-30)
- Phone: ✅ Available
- Website: ✅ Available
- Address: ⚡ Service area only
- Years in business: ✅ Detected

## ACTION REQUIRED
1. Run `debug-gbp-structure.js` to see actual data
2. Update `TestSmartRealPage.tsx` with correct field paths
3. Update `calculateDataRichness()` function
4. Test with location ID above
5. Confirm suppression is working correctly

**DO NOT proceed with other work until this is fixed!**
