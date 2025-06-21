# Google OAuth & Business Profile Setup Summary

## What We've Built

### Authentication Flow
1. **Sign Up** (`/auth/signup`)
   - Users sign up with Google (Gmail only)
   - Requests Google Business Profile permissions
   - Creates user account in database
   - Redirects to onboarding

2. **Sign In** (`/auth/signin`) 
   - Existing users sign in with Google
   - Checks for existing sites
   - Redirects to dashboard or onboarding

3. **Onboarding** (`/onboarding`)
   - Pre-fills business info from Google Business Profile
   - Creates GHL sub-account
   - Sets up website

### Database Schema
- NextAuth tables (User, Account, Session)
- Stores Google OAuth tokens for API access
- Links to Site records for multi-tenant setup

## Next Steps to Complete

### 1. Set up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
   ```

### 2. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Add to `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret"
```

### 3. Update Navigation
Run the script to update links:
```bash
chmod +x update-nav.sh
./update-nav.sh
```

### 4. Test the Flow
1. Visit http://localhost:3000
2. Click "Get Started" or "Sign In"
3. Sign in with a Gmail account
4. Should redirect to onboarding

## How It Works

1. **User clicks "Get Started"** ? Goes to `/auth/signup`
2. **Signs in with Google** ? NextAuth handles OAuth flow
3. **Google returns tokens** ? We store access_token and refresh_token
4. **Check for existing sites** ? If none, redirect to `/onboarding`
5. **Onboarding uses tokens** ? To access Google Business Profile API
6. **Creates everything** ? GHL sub-account, website, SEO setup

## Security Notes
- Only Gmail accounts allowed
- Google tokens stored encrypted in database
- Tokens auto-refresh when expired
- Each user isolated by tenant

## API Access
With the stored Google tokens, we can:
- Search/claim Google Business Profiles
- Update business information
- Manage reviews and posts
- Track insights
- Schedule posts
