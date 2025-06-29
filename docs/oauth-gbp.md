# ✅ GBP OAuth Access – Final Setup & Usage Instructions

## 🧠 What You Need to Know

1. **All 3 Google accounts are already authorized**
   OAuth tokens for:
   - `adrian.grindmastersinc@gmail.com`
   - `holliday@cursivemedia.com`
   - `theycallmeholla@gmail.com`
   
   ...are **already stored** in the database under Holliday's user ID.

2. **Tokens are valid and can access GBP**
   The `Account` model contains `access_token` + `refresh_token` for each.

3. **No need for re-authentication or new users**
   These are service accounts, not app users. They do **not** need to log in.

## 🧪 How to Use / Verify Access

### 🔹 Test GBP API Access for Any Email:
```bash
npm run unlock-gbp adrian.grindmastersinc@gmail.com
```
🔁 Internally maps to tokens already stored under Holliday's user ID

### 🔹 List All Google OAuth Accounts:
```bash
npx tsx scripts/list-gbp-oauth-emails.ts
```

### 🔹 Debug Token Ownership:
```bash
npx tsx scripts/debug-google-accounts.ts
```

### 🔹 Summarize All Accounts + GBP Status:
```bash
npx tsx scripts/gbp-account-summary.ts
```

## 📌 Notes for Future Devs / LLM Agents

- **Never create duplicate user records** for service accounts
- **Never expect a 1:1 match between email and user**
  - All OAuth tokens are stored under Holliday's `userId`
- **Use the email → token mapping**, not user login flow

## 🔍 Technical Implementation Details

### How It Works

1. **OAuth Token Storage**
   - All tokens are stored in the `Account` table
   - They're linked to a single `userId` (Holliday's)
   - The `providerAccountId` field contains the Google account ID

2. **Token Retrieval Logic**
   ```javascript
   // The system finds tokens by providerAccountId, not by email
   // This allows multiple Google accounts to share one app user
   const account = await prisma.account.findFirst({
     where: {
       provider: 'google',
       providerAccountId: googleAccountId
     }
   });
   ```

3. **Automatic Token Refresh**
   - When `access_token` expires, the system uses `refresh_token`
   - This happens automatically in `getGBPAccessToken()`
   - No user intervention required

### Available Location IDs

| Google Account | Location Name | Location ID |
|---------------|---------------|-------------|
| adrian.grindmastersinc@gmail.com | Grind Masters Inc | locations/2315391108903134470 |
| theycallmeholla@gmail.com | Everlast Energy | locations/6848695004722343500 |
| holliday@cursivemedia.com | Various (10+) | See `list-gbp-locations.ts` |

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "No Google OAuth account found" | Looking for wrong email | Use the actual Google account email |
| "403 Forbidden" | Token doesn't have access to location | Verify location belongs to the Google account |
| "Token refresh failed" | Refresh token revoked | Requires manual re-authentication |

## 🚀 Quick Test

To verify everything is working:

```bash
# Test all three accounts
npm run unlock-gbp

# Test specific location access
curl "http://localhost:3000/dev/test-smart-real?locationId=locations/2315391108903134470"
```

---

**Last Updated**: June 29, 2025
**Maintained By**: Suite Business Engineering Team
