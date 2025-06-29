# 🔓 GBP Access Unlock Documentation

## Overview
This implementation unlocks access to all Google Business Profile (GBP) listings using OAuth tokens already stored in the database.

## Files Created

### 1. **`utils/gbp-auth.js`** - Core Authentication Utility
Main functions:
- `getGBPAccessToken(email)` - Gets a valid access token (refreshes if needed)
- `refreshGoogleToken(account)` - Refreshes expired tokens
- `getAllGoogleAccounts()` - Lists all Google OAuth accounts
- `testGBPAccess(email, locationId)` - Tests GBP API access

### 2. **`scripts/unlock-gbp-access.js`** - Test & Report Script
Run this to test all known GBP locations:
```bash
node scripts/unlock-gbp-access.js
```

This will:
- Query all Google OAuth accounts
- Test access to specific locations
- Report which accounts work, need refresh, or fail

### 3. **`scripts/gbp-comprehensive-report.js`** - Full Location Scanner
Run this to discover ALL locations across accounts:
```bash
node scripts/gbp-comprehensive-report.js
```

This will:
- Scan all accounts for their GBP locations
- Generate a comprehensive report
- Save results to a JSON file

### 4. **`app/api/gbp/test-access/route.js`** - API Endpoint
Test via HTTP requests:

```bash
# List all Google accounts
curl http://localhost:3000/api/gbp/test-access?action=list

# Test specific location
curl "http://localhost:3000/api/gbp/test-access?action=test&email=adrian.grindmastersinc@gmail.com&locationId=locations/2315391108903134470"

# Check if token works for email
curl "http://localhost:3000/api/gbp/test-access?action=token&email=theycallmeholla@gmail.com"
```

## Usage Instructions

### Step 1: Run Initial Test
```bash
cd /Users/cursivemedia/Downloads/scratch-dev/suitebusiness
node scripts/unlock-gbp-access.js
```

### Step 2: Check Results
The script will show:
- ✅ Accounts with working tokens
- 🔄 Tokens that were refreshed
- ❌ Failed accounts
- ⚠️ Missing accounts

### Step 3: Get Full Location List
```bash
node scripts/gbp-comprehensive-report.js
```

### Step 4: Integrate into Your App
```javascript
import { getGBPAccessToken } from './utils/gbp-auth.js';

// In your GBP API routes
async function fetchGBPData(email, locationId) {
  const accessToken = await getGBPAccessToken(email);
  
  const response = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  return response.json();
}
```

## Environment Variables Required
Make sure these are set in your `.env` file:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
DATABASE_URL=your_database_url
```

## Expected Test Results

| Email | Location ID | Expected Status |
|-------|------------|-----------------|
| adrian.grindmastersinc@gmail.com | locations/2315391108903134470 | ✅ Working |
| theycallmeholla@gmail.com | locations/6848695004722343500 | ❓ To Test |
| holliday@cursivemedia.com | locations/14834752219176972003 | ❓ To Test |

## Troubleshooting

### Token Refresh Fails
- User needs to re-authenticate through Google OAuth flow
- Check if `refresh_token` exists in database

### No Account Found
- User hasn't connected their Google account
- Need to implement OAuth connection flow

### API Returns 403/401
- Token might be invalid even after refresh
- Check OAuth scopes include GBP access
- User might have revoked access

## Next Steps

1. **Automated Token Refresh**: Set up a cron job to refresh tokens before they expire
2. **Full GBP Sync**: Use working tokens to sync all GBP data
3. **Error Monitoring**: Log failed token refreshes for manual intervention
4. **User Notifications**: Alert users when re-authentication is needed

## Security Notes
- Never expose access tokens in API responses
- Always validate email ownership before using tokens
- Log token usage for audit trails
- Implement rate limiting on token refresh attempts
